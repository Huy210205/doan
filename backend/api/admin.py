from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import calendar

from core.database import get_db
from models.schema import User, Scan, Vulnerability
from api.deps import get_current_user

router = APIRouter()

@router.get("/overview")
def get_dashboard_overview(
    month: int = Query(default=None),
    year: int = Query(default=None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền truy cập")
        
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    
    # Vulnerability breakdown
    critical_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "Critical").count()
    high_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "High").count()
    medium_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "Medium").count()
    low_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "Low").count()
    
    # Chart logic
    now = datetime.utcnow()
    target_month = month if month else now.month
    target_year = year if year else now.year
    
    # Get number of days in the target month
    num_days = calendar.monthrange(target_year, target_month)[1]
    
    daily_stats = []
    for day in range(1, num_days + 1):
        target_date = datetime(target_year, target_month, day).date()
        scans_count = db.query(Scan).filter(func.date(Scan.created_at) == target_date).count()
        
        details = []
        if scans_count > 0:
            scans_on_date = db.query(Scan, User.email)\
                .join(User, User.id == Scan.user_id)\
                .filter(func.date(Scan.created_at) == target_date)\
                .all()
            
            user_counts = {}
            for s, email in scans_on_date:
                user_counts[email] = user_counts.get(email, 0) + 1
                
            for email, count in user_counts.items():
                details.append({
                    "email": email,
                    "count": count
                })
                
        daily_stats.append({
            "name": f"{day}/{target_month}",
            "scans": scans_count,
            "details": details
        })
        
    return {
        "totalUsers": total_users,
        "totalScans": total_scans,
        "vulnerabilities": {
            "critical": critical_vulns,
            "high": high_vulns,
            "medium": medium_vulns,
            "low": low_vulns
        },
        "monthlyScans": daily_stats
    }

@router.get("/vulnerabilities")
def get_all_vulnerabilities(user_id: str = None, severity: str = None, skip: int = 0, limit: int = 15, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền truy cập")
        
    # Join Vulnerability, Scan, and User using outerjoin to ensure no data is lost
    query = db.query(Vulnerability, Scan.target_url, Scan.created_at, User.email)\
              .outerjoin(Scan, Scan.id == Vulnerability.scan_id)\
              .outerjoin(User, User.id == Scan.user_id)
              
    if user_id:
        query = query.filter(Scan.user_id == int(user_id))
    if severity:
        query = query.filter(Vulnerability.severity == severity)
        
    vulns = query.order_by(Vulnerability.created_at.desc()).offset(skip).limit(limit).all()
              
    result = []
    for v, target_url, scan_date, email in vulns:
        result.append({
            "id": v.id,
            "user_email": email,
            "vuln_type": v.vuln_type,
            "severity": v.severity,
            "url": v.url,
            "parameter_name": v.parameter_name,
            "payload": v.payload,
            "evidence": v.evidence,
            "confidence": v.confidence,
            "target_url": target_url,
            "scan_date": scan_date.strftime("%Y-%m-%d %H:%M:%S") if scan_date else ""
        })
        
    return result
