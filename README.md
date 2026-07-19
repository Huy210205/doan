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



## 🚀 Hướng Dẫn Cài Đặt Dành Cho Thành Viên (Môi trường Dev)

Hiện tại toàn bộ hệ thống (Frontend, Backend, và Database) đã được cấu hình chung vào một file Docker Compose. Bạn chỉ cần 1 lệnh duy nhất để chạy tất cả!

Yêu cầu máy tính phải cài đặt và **đang mở sẵn** ứng dụng [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### 1. Khởi chạy toàn bộ hệ thống
Mở Terminal tại thư mục gốc của dự án (`d:\doan`) và chạy lệnh:

Trước khi chạy lần đầu, hãy tạo file `.env` ở thư mục gốc bằng cách copy từ `.env.example`:

Sau đó mở file `.env` và điền `SMTP_EMAIL` / `SMTP_PASSWORD` nếu muốn gửi mail thật. Nếu để trống, hệ thống sẽ dùng chế độ demo và in OTP ra log backend.

```bash
docker-compose up --build
```
*(Nếu muốn chạy ngầm, bạn có thể thêm cờ `-d`: `docker-compose up -d --build`)*

Lệnh trên sẽ tự động:
1. Tự động build **Backend FastAPI** và cài đặt các thư viện Python.
2. Tự động build **Frontend ReactJS** và cài đặt các package Node.js.
3. Khởi tạo Database **PostgreSQL** mới.
4. Chạy **Flyway** để tự động tạo cấu trúc các bảng (Users, Scans...).
5. Khởi động **pgAdmin** để bạn có thể xem Database trực quan.

### 2. Truy cập ứng dụng
Sau khi lệnh chạy xong và hiển thị log thành công, mở trình duyệt truy cập:
- **Giao diện Web chính (Frontend):** `http://localhost:3000`

- **Quản lý Database (pgAdmin):** `http://localhost:5050` *(Tài khoản: `admin@admin.com` / `admin`)*

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


