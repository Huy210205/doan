from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random

from core.database import get_db
from models.schema import Scan, Vulnerability, RemediationKB, User, get_vn_time
from scanner.crawler import Crawler
from scanner.sqli import SQLiScanner
from scanner.xss import XSSScanner
from scanner.csrf import CSRFScanner
from scanner.lfi import LFIScanner
from models.classifier import AIClassifier
from api.deps import get_current_user
import time

router = APIRouter()
classifier = AIClassifier()

class ScanRequest(BaseModel):
    url: str
    delay_ms: int = 0
    max_depth: int = 1
    auth_header: str = ""

def perform_scan(scan_id: int, target_url: str, delay_ms: int, max_depth: int, auth_header: str, db: Session):
    try:
        # 1. Crawl
        print(f"Starting general scan for: {target_url} (Max Depth: {max_depth})")
        crawler = Crawler(target_url, max_depth=max_depth, auth_header=auth_header)
        crawler.crawl()
        endpoints = crawler.get_endpoints()
        
        # Ưu tiên các form nhập liệu và link có tham số (vì đây là nơi dễ có lỗi nhất)
        prioritized_endpoints = [e for e in endpoints if e['type'] == 'form' or len(e['params']) > 0]
        other_endpoints = [e for e in endpoints if e not in prioritized_endpoints]
        
        # Kết hợp lại và giới hạn khoảng 30 endpoints để demo chạy mượt
        endpoints_to_scan = (prioritized_endpoints + other_endpoints)[:30]
        print(f"Found {len(endpoints)} endpoints. Scanning {len(endpoints_to_scan)} (prioritizing forms).")
        
        # 2. Scan
        sqli = SQLiScanner(auth_header)
        xss = XSSScanner(auth_header)
        csrf = CSRFScanner(auth_header)
        lfi = LFIScanner(auth_header)
        all_vulns = []
        
        for endpoint in endpoints_to_scan:
            # Rate limiting (Delay)
            if delay_ms > 0:
                time.sleep(delay_ms / 1000.0)
                
            sqli_vulns = sqli.scan(endpoint)
            xss_vulns = xss.scan(endpoint)
            csrf_vulns = csrf.scan(endpoint)
            lfi_vulns = lfi.scan(endpoint)
            
            all_vulns.extend(sqli_vulns)
            all_vulns.extend(xss_vulns)
            all_vulns.extend(csrf_vulns)
            all_vulns.extend(lfi_vulns)
            
        # 3. Save vulnerabilities
        for v in all_vulns:
            # Fake response status for AI prediction
            status_code = 500 if v['type'] == 'SQLi' else 200
            severity, confidence = classifier.predict_with_confidence(v['type'], v['payload'], status_code)
            
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

@router.post("/scan")
def create_scan(request: ScanRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_scan = Scan(target_url=request.url, status="running", user_id=current_user.id)
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    
    perform_scan(new_scan.id, request.url, request.delay_ms, request.max_depth, request.auth_header, db)
    db.refresh(new_scan)
    
    return {"message": "Scan completed", "scan_id": new_scan.id, "status": new_scan.status}

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
        code_snippet = kb.code_snippet if kb else ""
        result.append({
            "id": v.id,
            "type": v.vuln_type,
            "severity": v.severity,
            "param": v.parameter_name,
            "payload": v.payload,
            "confidence": v.confidence,
            "evidence": v.evidence,
            "recommendation": recommendation,
            "code_snippet": code_snippet
        })
    return result
