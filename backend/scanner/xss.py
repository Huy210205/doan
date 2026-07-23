import requests
import copy
import os

class XSSScanner:
    def __init__(self, auth_header=None):
        self.headers = {}
        if auth_header:
            parts = auth_header.split(':', 1)
            if len(parts) == 2:
                self.headers[parts[0].strip()] = parts[1].strip()

        # Load payloads từ file text
        self.payloads = []
        payload_file = os.path.join(os.path.dirname(__file__), 'payloads', 'xss.txt')
        if os.path.exists(payload_file):
            with open(payload_file, 'r', encoding='utf-8') as f:
                self.payloads = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        if not self.payloads:
            self.payloads = [
                "<script>alert('xss')</script>",
                "\"<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>"
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
                test_params = copy.deepcopy(params)
                test_params[param_name] = f"test_{payload}" # prepend to avoid simple matching errors
                
                print(f"Testing XSS on: {url} | Param: {param_name}")
                try:
                    if method == "POST":
                        response = requests.post(url, data=test_params, headers=self.headers, timeout=5)
                    else:
                        response = requests.get(url, params=test_params, headers=self.headers, timeout=5)
                        
                    response_time_ms = int(response.elapsed.total_seconds() * 1000)
                    content_length_diff = len(response.text)
                    
                    # Nếu payload xuất hiện nguyên vẹn trong response -> có khả năng lỗi XSS Reflected
                    if payload in response.text:
                        vulnerabilities.append({
                            "url": url,
                            "type": "XSS",
                            "param": param_name,
                            "payload": payload,
                            "severity": "High",
                            "evidence": f"Payload reflected in response body",
                            "response_time_ms": response_time_ms,
                            "content_length_diff": content_length_diff,
                            "error_keyword_match": 0
                        })
                        break
                except Exception as e:
                    print(f"Request failed: {e}")
                    
        return vulnerabilities
