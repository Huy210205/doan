import requests

class SQLiScanner:
    def __init__(self):
        # Một số payload cơ bản để test
        self.payloads = [
            "'",
            "' OR 1=1--",
            '" OR 1=1--',
            "1' OR '1'='1"
        ]
        
        # Các dấu hiệu lỗi SQL trong response
        self.sql_errors = [
            "you have an error in your sql syntax;",
            "warning: mysql",
            "unclosed quotation mark after the character string",
            "quoted string not properly terminated"
        ]

    def scan(self, url):
        vulnerabilities = []
        
        # Test đơn giản bằng cách chèn payload vào cuối URL nếu có tham số
        if "?" in url:
            base_url, params = url.split("?", 1)
            for payload in self.payloads:
                test_url = f"{url}{payload}"
                print(f"Testing SQLi on: {test_url}")
                try:
                    response = requests.get(test_url, timeout=5)
                    for error in self.sql_errors:
                        if error in response.text.lower():
                            vulnerabilities.append({
                                "url": url,
                                "type": "SQLi",
                                "payload": payload,
                                "severity": "High"
                            })
                            break
                except Exception as e:
                    print(f"Request failed: {e}")
                    
        return vulnerabilities
