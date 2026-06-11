import requests

class LFIScanner:
    def __init__(self):
        self.payloads = [
            "../../../../etc/passwd",
            "..\\..\\..\\..\\windows\\win.ini",
            "/etc/passwd"
        ]

    def scan(self, url: str):
        vulns = []
        if "?" not in url:
            return vulns
            
        try:
            # Mock scanning logic for demo
            if "file=" in url or "page=" in url or "doc=" in url:
                # Fake finding an LFI vulnerability on file-fetching endpoints
                vulns.append({
                    "type": "LFI",
                    "payload": "../../../../etc/passwd",
                    "param": "file_path"
                })
        except Exception:
            pass
        return vulns
