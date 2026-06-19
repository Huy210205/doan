class CSRFScanner:
    def __init__(self, auth_header=None):
        self.headers = {}
        if auth_header:
            parts = auth_header.split(':', 1)
            if len(parts) == 2:
                self.headers[parts[0].strip()] = parts[1].strip()

    def scan(self, endpoint):
        vulns = []
        if endpoint.get('type') == 'form' and endpoint.get('method', '').upper() == 'POST':
            # Check if any param looks like a CSRF token
            anti_csrf_keywords = ['csrf', 'token', 'authenticity', 'nonce']
            has_token = False
            for param in endpoint.get('params', {}).keys():
                param_lower = param.lower()
                if any(keyword in param_lower for keyword in anti_csrf_keywords):
                    has_token = True
                    break
                    
            if not has_token:
                vulns.append({
                    "url": endpoint['url'],
                    "type": "CSRF",
                    "param": "N/A",
                    "payload": "Missing Anti-CSRF Token in POST form",
                    "severity": "Medium",
                    "evidence": "No parameter matching common CSRF token names found in form submission."
                })
        return vulns
