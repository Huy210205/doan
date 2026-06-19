import requests
import copy

class XSSScanner:
    def __init__(self):
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
                        response = requests.post(url, data=test_params, timeout=5)
                    else:
                        response = requests.get(url, params=test_params, timeout=5)
                        
                    # Nếu payload xuất hiện nguyên vẹn trong response -> có khả năng lỗi XSS Reflected
                    if payload in response.text:
                        vulnerabilities.append({
                            "url": url,
                            "type": "XSS",
                            "param": param_name,
                            "payload": payload,
                            "severity": "High",
                            "evidence": f"Payload reflected in response body"
                        })
                        break
                except Exception as e:
                    print(f"Request failed: {e}")
                    
        return vulnerabilities
