import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# For demo purposes, the user will configure these via env vars,
# but we will fallback to printing to console if not configured.
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_otp_email(to_email: str, otp: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        # Fallback to console print if not configured
        print("="*50)
        print(f"[DEMO MODE] EMAIL CHƯA CẤU HÌNH SMTP")
        print(f"Gửi OTP đến: {to_email}")
        print(f"MÃ OTP CỦA BẠN LÀ: {otp}")
        print("="*50)
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Web Security AI - Mã xác nhận (OTP)"

        body = f"""
        Xin chào,
        
        Cảm ơn bạn đã đăng ký hệ thống Web Security AI.
        Mã xác nhận (OTP) của bạn là: {otp}
        
        Mã này sẽ hết hạn trong vòng 10 phút.
        Trân trọng.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False
