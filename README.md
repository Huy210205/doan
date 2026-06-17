# AI WebSec Scanner 🛡️

AI WebSec Scanner là một hệ thống phân tích và quét lỗ hổng bảo mật ứng dụng web được tích hợp Trí Tuệ Nhân Tạo (AI). Hệ thống tự động thu thập liên kết, mô phỏng các cuộc tấn công và sử dụng thuật toán Học máy (Machine Learning) để dự đoán mức độ nghiêm trọng của các lỗ hổng tìm thấy.

## 🌟 Tính Năng Nổi Bật

- **Crawler Thông Minh**: Tự động bóc tách và thu thập các đường dẫn (URLs) trên trang mục tiêu với độ sâu tùy biến.
- **4 Module Máy Quét (Scanners)**:
  - **SQL Injection (SQLi)**: Phát hiện lỗi tiêm nhiễm cơ sở dữ liệu.
  - **Cross-Site Scripting (XSS)**: Bắt lỗi thực thi mã độc trên trình duyệt.
  - **Cross-Site Request Forgery (CSRF)**: Kiểm tra trạng thái bảo vệ biểu mẫu.
  - **Local File Inclusion (LFI)**: Ngăn chặn đọc trộm tệp tin hệ thống.
- **Đánh Giá Bằng AI**: Tích hợp mô hình Học máy (Random Forest) để tự động đánh giá độ nguy hiểm (Severity) và độ tin cậy (Confidence).
- **Xuất Báo Cáo Chuyên Nghiệp**: Báo cáo PDF tích hợp chuẩn hóa font chữ tiếng Việt.
- **Giao Diện Hiện Đại**: Thiết kế UI Premium (Glassmorphism) cực kỳ bắt mắt.



## 🚀 Hướng Dẫn Cài Đặt Dành Cho Thành Viên

Để chạy dự án, hãy làm theo các bước sau đây. Bạn cần chạy song song cả 2 phần: Backend (Database & API) và Frontend (Giao diện Web).

### 1. Khởi chạy Backend & Cơ sở dữ liệu (Docker)
Yêu cầu đã cài đặt sẵn [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# Mở Terminal tại gốc dự án (d:\doan)
# 1. Khởi tạo Database và API Backend tự động
docker compose up -d
```
Lệnh trên sẽ tự động:
- Khởi tạo Database **PostgreSQL** mới tinh.
- Chạy **Flyway** để tự động tạo cấu trúc các bảng (Users, Scans...).
- Chạy **Backend FastAPI** tại cổng `8000`.

*Lưu ý: Bảng điều khiển quản lý DB (pgAdmin) sẽ chạy ở `http://localhost:5050` (Tài khoản: `admin@admin.com` / `admin`). Cổng API Backend là `http://localhost:8000/docs`*

### 2. Khởi chạy Frontend (ReactJS)
Yêu cầu máy tính có cài sẵn [Node.js](https://nodejs.org/).

```bash
# 1. Chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện (chỉ chạy 1 lần sau khi clone)
npm install

# 3. Chạy giao diện web
npm run dev
```

Sau khi chạy xong, mở trình duyệt truy cập: **`http://localhost:5173`** để bắt đầu sử dụng dự án!

## 📧 Lưu ý về Đăng ký Tài khoản (Mã OTP)
Hệ thống có tính năng gửi Email chứa mã OTP xác thực khi đăng ký. Tuy nhiên, để tiện cho quá trình phát triển nhóm, hệ thống đã bật sẵn **Chế độ Demo (Fallback)**:
- Nếu bạn **không cấu hình** thông tin `SMTP_EMAIL` trong file `.env`, hệ thống sẽ không cố gửi email thật.
- Thay vào đó, mã OTP sẽ được in thẳng ra cửa sổ dòng lệnh của Backend.
- Để lấy mã OTP khi đăng ký, bạn chỉ cần mở Terminal lên và gõ:
  ```bash
  docker compose logs backend
  ```
  *(Cuộn xuống cuối log để thấy mã xác nhận 6 số và điền vào giao diện web).*

## 🧠 Huấn Luyện Lại AI (Tùy Chọn)
Nếu bạn muốn sinh thêm dữ liệu ngẫu nhiên và huấn luyện lại mô hình AI Random Forest, hãy mở Terminal mới và chạy:

```bash
docker compose exec backend python ml/generate_data.py
docker compose exec backend python ml/train_model.py
```


