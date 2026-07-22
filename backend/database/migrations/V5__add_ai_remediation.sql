-- Thêm các cột cho AI Remediation vào bảng vulnerabilities
ALTER TABLE vulnerabilities
ADD COLUMN ai_recommendation TEXT,
ADD COLUMN ai_code_snippet TEXT;
