from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from core.database import Base

def get_vn_time():
    return datetime.utcnow() + timedelta(hours=7)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_vn_time)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")

class OTPVerification(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=get_vn_time)

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_url = Column(String(255), nullable=False)
    status = Column(String(50), default="running")
    created_at = Column(DateTime, default=get_vn_time)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="scans")
    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"))
    vuln_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=True)
    url = Column(String(500), nullable=False)
    parameter_name = Column(String(100), nullable=True)
    payload = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="vulnerabilities")

class RemediationKB(Base):
    __tablename__ = "remediation_kb"

    id = Column(Integer, primary_key=True, index=True)
    vuln_type = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    code_snippet = Column(Text, nullable=True)
