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
from typing import Optional
from api.deps import get_current_user

class RegisterRequest(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    logo: Optional[str] = None

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email đã được đăng ký")
        else:
            # Update password for unverified user and resend OTP
            user.hashed_password = get_password_hash(request.password)
            # Generate new OTP
            otp_code = ''.join(random.choices(string.digits, k=6))
            expire_time = get_vn_time() + timedelta(minutes=10)
            otp_record = OTPVerification(email=request.email, otp=otp_code, expires_at=expire_time)
            db.add(otp_record)
            db.commit()
            send_otp_email(request.email, otp_code)
            return {"message": "Tài khoản chưa xác thực. Đã gửi lại mã OTP vào email của bạn."}
            
    hashed_pwd = get_password_hash(request.password)
    new_user = User(email=request.email, username=request.username, hashed_password=hashed_pwd)
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
        OTPVerification.email == request.email
    ).order_by(OTPVerification.created_at.desc()).first()
    
    if not otp_record or otp_record.otp != request.otp:
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
        # Generate new OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expire_time = get_vn_time() + timedelta(minutes=10)
        otp_record = OTPVerification(email=request.email, otp=otp_code, expires_at=expire_time)
        db.add(otp_record)
        db.commit()
        send_otp_email(request.email, otp_code)
        raise HTTPException(status_code=403, detail="Tài khoản chưa được xác thực. Đã gửi lại mã OTP vào email của bạn.")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "email": user.email,
        "username": user.username,
        "logo": user.logo
    }

@router.put("/update-profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request.username is not None:
        current_user.username = request.username
    if request.logo is not None:
        current_user.logo = request.logo
        
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Cập nhật hồ sơ thành công",
        "username": current_user.username,
        "logo": current_user.logo
    }
