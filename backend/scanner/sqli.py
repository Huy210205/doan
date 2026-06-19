import requests
import copy
import os

class SQLiScanner:
    def __init__(self, auth_header=None):
        self.headers = {}
        if auth_header:
            parts = auth_header.split(':', 1)
            if len(parts) == 2:
                self.headers[parts[0].strip()] = parts[1].strip()

        # Load payloads từ file text
        self.payloads = []
        payload_file = os.path.join(os.path.dirname(__file__), 'payloads', 'sqli.txt')
        if os.path.exists(payload_file):
            with open(payload_file, 'r', encoding='utf-8') as f:
                self.payloads = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        if not self.payloads:
            # Fallback
            self.payloads = [
                "'",
                "' OR 1=1--",
                '" OR 1=1--',
                "1' OR '1'='1",
                "admin' --"
            ]
        
        # Các dấu hiệu lỗi SQL trong response
        self.sql_errors = [
            "you have an error in your sql syntax;",
            "warning: mysql",
            "unclosed quotation mark after the character string",
            "quoted string not properly terminated",
            "sql exception",
            "microsoft ole db provider for sql server",
            "syntax error in string in query expression"
        ]

    def scan(self, endpoint):
        vulnerabilities = []
        url = endpoint.get("url")
        method = endpoint.get("method", "GET").upper()
        params = endpoint.get("params", {})
        
        if not params:
            return vulnerabilities

        for param_name in params.keys():
            for payload in self.payloads:
                # Fuzzing: Giữ nguyên các tham số khác, chỉ thay đổi tham số đang test
                test_params = copy.deepcopy(params)
                test_params[param_name] = payload
                
                print(f"Testing SQLi on: {url} | Param: {param_name} | Payload: {payload}")
                try:
                    if method == "POST":
                        response = requests.post(url, data=test_params, headers=self.headers, timeout=5)
                    else:
                        response = requests.get(url, params=test_params, headers=self.headers, timeout=5)
                        
                    response_text = response.text.lower()
                    
                    # 1. Error-based SQLi: Tìm thông báo lỗi SQL
                    for error in self.sql_errors:
                        if error in response_text:
                            vulnerabilities.append({
                                "url": url,
                                "type": "SQLi",
                                "param": param_name,
                                "payload": payload,
                                "severity": "High",
                                "evidence": f"Found SQL error: '{error}' in response"
                            })
                            break
                            
                    # 2. Boolean-based (Authentication Bypass) SQLi: Đoán lỗi dựa trên việc login thành công
                    # (Đây là logic giả định cho demo.testfire.net, có thể cải tiến thêm để tổng quát hơn)
                    if "sign off" in response_text or "logout" in response_text or "welcome" in response_text:
                         # Nếu payload là OR 1=1 mà tự nhiên đăng nhập được, đó có thể là SQLi auth bypass
                         if "1=1" in payload or "--" in payload:
                             vulnerabilities.append({
                                "url": url,
                                "type": "SQLi",
                                "param": param_name,
                                "payload": payload,
                                "severity": "High",
                                "evidence": f"Possible Authentication Bypass with payload: {payload}"
                             })
                except Exception as e:
                    print(f"Request failed on {url}: {e}")
                    
        return vulnerabilities
