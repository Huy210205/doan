from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
import time
import concurrent.futures

from core.database import get_db, SessionLocal
from models.schema import Scan, Vulnerability, RemediationKB, User, get_vn_time
from scanner.crawler import Crawler
from scanner.sqli import SQLiScanner
from scanner.xss import XSSScanner
from scanner.csrf import CSRFScanner
from scanner.lfi import LFIScanner
from models.classifier import AIClassifier
from ml.ai_remediation import AIRemediationService
from api.deps import get_current_user

router = APIRouter()
classifier = AIClassifier()
ai_remediator = AIRemediationService()

cancel_flags = {}

class ScanRequest(BaseModel):
    url: str
    delay_ms: int = 0
    max_depth: int = 1
    auth_header: str = ""

def perform_scan(scan_id: int, target_url: str, delay_ms: int, max_depth: int, auth_header: str):
    db = SessionLocal()
    cancel_flags[scan_id] = False
    try:
        # 1. Crawl
        print(f"Starting general scan for: {target_url} (Max Depth: {max_depth})")
        crawler = Crawler(target_url, max_depth=max_depth, auth_header=auth_header)
        crawler.crawl()
        endpoints = crawler.get_endpoints()
        
        # Ưu tiên các form nhập liệu và link có tham số (vì đây là nơi dễ có lỗi nhất)
        prioritized_endpoints = [e for e in endpoints if e['type'] == 'form' or len(e['params']) > 0]
        other_endpoints = [e for e in endpoints if e not in prioritized_endpoints]
        
        # Kết hợp lại (ưu tiên form trước) và quét toàn bộ (giới hạn 100 để tránh tràn bộ nhớ/thời gian quá dài)
        endpoints_to_scan = (prioritized_endpoints + other_endpoints)[:100]
        print(f"Found {len(endpoints)} endpoints. Scanning {len(endpoints_to_scan)} (prioritizing forms).")
        
        # 2. Scan
        sqli = SQLiScanner(auth_header)
        xss = XSSScanner(auth_header)
        csrf = CSRFScanner(auth_header)
        lfi = LFIScanner(auth_header)
        all_vulns = []
        
        def scan_endpoint(endpoint):
            if cancel_flags.get(scan_id, False):
                return []
                
            # Thêm jitter nhỏ để tránh các luồng đập request cùng 1 mili-giây
            jitter = random.uniform(0.1, 0.5)
            if delay_ms > 0:
                time.sleep((delay_ms / 1000.0) + jitter)
            else:
                time.sleep(jitter)
            
            if cancel_flags.get(scan_id, False):
                return []
                
            vulns = []
            vulns.extend(sqli.scan(endpoint))
            vulns.extend(xss.scan(endpoint))
            vulns.extend(csrf.scan(endpoint))
            vulns.extend(lfi.scan(endpoint))
            return vulns

        # Sử dụng 3 luồng  để tránh làm server mục tiêu bị sập hoặc drop request (gây lọt lỗi)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_to_ep = {executor.submit(scan_endpoint, ep): ep for ep in endpoints_to_scan}
            for future in concurrent.futures.as_completed(future_to_ep):
                if cancel_flags.get(scan_id, False):
                    break
                try:
                    all_vulns.extend(future.result())
                except Exception as exc:
                    print(f'Endpoint generated an exception: {exc}')
            
        if cancel_flags.get(scan_id, False):
            print(f"Scan {scan_id} was stopped by user.")
            scan_obj = db.query(Scan).filter(Scan.id == scan_id).first()
            if scan_obj:
                scan_obj.status = "Stopped"
                db.commit()
            return
            
        # 3. Save vulnerabilities
        for v in all_vulns:
            # Fake response status for AI prediction
            status_code = 500 if v['type'] == 'SQLi' else 200
            
            response_time_ms = v.get('response_time_ms', 100)
            content_length_diff = v.get('content_length_diff', 0)
            error_keyword_match = v.get('error_keyword_match', 0)
            
            severity, confidence = classifier.predict_with_confidence(
                v['type'], v['payload'], status_code, 
                response_time_ms, content_length_diff, error_keyword_match
            )
            
            # Đảm bảo lấy đúng các trường đã được cải tiến trong máy quét
            db_vuln = Vulnerability(
                scan_id=scan_id,
                vuln_type=v['type'],
                severity=severity,
                url=v.get('url', target_url),
                parameter_name=v.get('param', 'unknown'),
                payload=v['payload'],
                confidence=confidence,
                evidence=v.get('evidence', "Phát hiện dấu hiệu bất thường.")
            )
            db.add(db_vuln)
            
        # Update scan status
        scan_obj = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan_obj:
            scan_obj.status = "Completed"
            scan_obj.completed_at = get_vn_time()
            
        db.commit()
    except Exception as e:
        print("Error during scan:", e)
        scan_obj = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan_obj:
            scan_obj.status = "Failed"
            db.commit()
    finally:
        db.close()

@router.post("/scan")
def create_scan(request: ScanRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_scan = Scan(target_url=request.url, status="running", user_id=current_user.id)
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    
    background_tasks.add_task(perform_scan, new_scan.id, request.url, request.delay_ms, request.max_depth, request.auth_header)
    
    return {"message": "Scan started", "scan_id": new_scan.id, "status": new_scan.status}

@router.post("/scans/{scan_id}/stop")
def stop_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    if scan.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to stop this scan")
        
    if scan.status != "running":
        return {"message": f"Scan is already {scan.status}"}
        
    cancel_flags[scan_id] = True
    scan.status = "Stopped"
    db.commit()
    return {"message": "Scan stop requested"}

@router.get("/scans")
def get_scans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.id.desc()).all()
    result = []
    for s in scans:
        vuln_count = db.query(Vulnerability).filter(Vulnerability.scan_id == s.id).count()
        result.append({
            "id": f"SCN-{s.id:03d}",
            "raw_id": s.id,
            "url": s.target_url,
            "date": s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else "",
            "vulns": vuln_count,
            "status": s.status
        })
    return result

@router.get("/scans/{scan_id}/vulnerabilities")
def get_vulnerabilities(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found or not authorized")
        
    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan_id).all()
    result = []
    for v in vulns:
        kb = db.query(RemediationKB).filter(RemediationKB.vuln_type == v.vuln_type).first()
        recommendation = kb.recommendation if kb else "Cần rà soát lại mã nguồn. Validate đầu vào."
        description = kb.description if kb else "Hệ thống AI phát hiện bất thường dựa trên heuristics."
        code_snippet = kb.code_snippet if kb else ""
        result.append({
            "id": v.id,
            "type": v.vuln_type,
            "url": v.url,
            "severity": v.severity,
            "param": v.parameter_name,
            "payload": v.payload,
            "confidence": v.confidence,
            "evidence": v.evidence,
            "description": description,
            "recommendation": recommendation,
            "code_snippet": code_snippet,
            "ai_recommendation": v.ai_recommendation,
            "ai_code_snippet": v.ai_code_snippet
        })
    return result

@router.post("/scans/vulnerabilities/{vuln_id}/ai-remediation")
def generate_ai_remediation(vuln_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
        
    scan = db.query(Scan).filter(Scan.id == vuln.scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=403, detail="Not authorized to access this scan")

    # If already generated, return cached
    if vuln.ai_recommendation and vuln.ai_code_snippet:
        return {
            "ai_recommendation": vuln.ai_recommendation,
            "ai_code_snippet": vuln.ai_code_snippet
        }

    kb = db.query(RemediationKB).filter(RemediationKB.vuln_type == vuln.vuln_type).first()
    base_recommendation = kb.recommendation if kb else "Cần rà soát lại mã nguồn. Validate đầu vào."

    try:
        ai_rec, ai_code = ai_remediator.generate_remediation(
            vuln_type=vuln.vuln_type,
            url=vuln.url,
            parameter=vuln.parameter_name,
            payload=vuln.payload,
            base_recommendation=base_recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    vuln.ai_recommendation = ai_rec
    vuln.ai_code_snippet = ai_code
    db.commit()

    return {
        "ai_recommendation": ai_rec,
        "ai_code_snippet": ai_code
    }

@router.delete("/scans/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found or not authorized")
    db.delete(scan)
    db.commit()
    return {"message": "Scan deleted successfully"}
