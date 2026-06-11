-- Tạo bảng Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng OTP
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng lưu trữ thông tin quét (Scan)
CREATE TABLE scans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'running', -- running, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tạo bảng lưu trữ lỗ hổng (Vulnerabilities)
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
    vuln_type VARCHAR(100) NOT NULL, -- SQLi, XSS, CSRF, LFI
    severity VARCHAR(50) NOT NULL, -- Low, Medium, High, Critical
    confidence FLOAT, -- AI confidence score
    url VARCHAR(500) NOT NULL,
    parameter_name VARCHAR(100),
    payload TEXT,
    evidence TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng lưu trữ cơ sở tri thức khắc phục (Knowledge Base)
CREATE TABLE remediation_kb (
    id SERIAL PRIMARY KEY,
    vuln_type VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    recommendation TEXT,
    code_snippet TEXT
);

-- Dữ liệu mẫu ban đầu cho Knowledge Base
INSERT INTO remediation_kb (vuln_type, description, recommendation, code_snippet) VALUES
('SQLi', 'Lỗ hổng SQL Injection cho phép kẻ tấn công can thiệp vào câu truy vấn database.', 'Sử dụng Parameterized Queries hoặc Prepared Statements. Tuyệt đối không nối chuỗi trực tiếp vào câu query.', 'cursor.execute("SELECT * FROM users WHERE username = %s", (username,))'),
('XSS', 'Cross-Site Scripting (XSS) cho phép kẻ tấn công thực thi mã JavaScript độc hại trên trình duyệt của nạn nhân.', 'Encode/Escape dữ liệu trước khi in ra HTML. Sử dụng Content Security Policy (CSP).', 'import html\nsafe_output = html.escape(user_input)'),
('LFI', 'Lỗ hổng Local File Inclusion (LFI) cho phép kẻ tấn công đọc được các tệp tin nhạy cảm trên máy chủ.', 'Chỉ cho phép đọc các file trong một thư mục cụ thể và loại bỏ các ký tự ../ khỏi đường dẫn.', 'import os\nbase_dir = "/var/www/uploads/"\nfile_path = os.path.abspath(os.path.join(base_dir, filename))\nif not file_path.startswith(base_dir):\n    raise Exception("Invalid file path")'),
('CSRF', 'Lỗ hổng Cross-Site Request Forgery (CSRF) cho phép kẻ tấn công lừa người dùng thực hiện các hành động không mong muốn.', 'Sử dụng Anti-CSRF token cho tất cả các form và request POST/PUT/DELETE. Kiểm tra thuộc tính SameSite của Cookie.', '<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">');
