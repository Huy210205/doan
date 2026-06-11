import requests

class XSSScanner:
    def __init__(self):
        self.payloads = [
            "<script>alert('xss')</script>",
            "\"<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>"
        ]

    def scan(self, url):
        vulnerabilities = []
        
        if "?" in url:
            base_url, params = url.split("?", 1)
            for payload in self.payloads:
                test_url = f"{url}{payload}"
                print(f"Testing XSS on: {test_url}")
                try:
                    response = requests.get(test_url, timeout=5)
                    # Nếu payload xuất hiện nguyên vẹn trong response -> có khả năng lỗi XSS Reflected
                    if payload in response.text:
                        vulnerabilities.append({
                            "url": url,
                            "type": "XSS",
                            "payload": payload,
                            "severity": "High"
                        })
                        break
                except Exception as e:
                    print(f"Request failed: {e}")
                    
        return vulnerabilities
