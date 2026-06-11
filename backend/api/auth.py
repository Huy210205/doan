from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
import random
import string

from core.database import get_db
from models.schema import User, OTPVerification, get_vn_time
from core.auth import get_password_hash, verify_password, create_access_token
from core.email import send_otp_email

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
        
    hashed_pwd = get_password_hash(request.password)
    new_user = User(email=request.email, hashed_password=hashed_pwd)
    db.add(new_user)
    
    # Generate OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    expire_time = get_vn_time() + timedelta(minutes=10)
    
    otp_record = OTPVerification(email=request.email, otp=otp_code, expires_at=expire_time)
    db.add(otp_record)
    db.commit()
    
    # Send email
    send_otp_email(request.email, otp_code)
    
    return {"message": "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP."}

@router.post("/verify")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == request.email,
        OTPVerification.otp == request.otp
    ).order_by(OTPVerification.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Mã OTP không hợp lệ")
        
    if otp_record.expires_at < get_vn_time():
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn")
        
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        user.is_verified = True
        db.commit()
        
    return {"message": "Xác thực email thành công! Bạn có thể đăng nhập ngay."}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư.")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "email": user.email}
