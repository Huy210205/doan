import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qsl

class Crawler:
    def __init__(self, target_url, max_depth=2, auth_header=None):
        self.target_url = target_url
        self.max_depth = max_depth
        self.visited = set()
        self.endpoints = [] # List of dicts
        
        self.headers = {}
        if auth_header:
            parts = auth_header.split(':', 1)
            if len(parts) == 2:
                self.headers[parts[0].strip()] = parts[1].strip()

    def is_same_domain(self, url):
        return urlparse(self.target_url).netloc == urlparse(url).netloc

    def extract_params_from_url(self, url):
        parsed = urlparse(url)
        return dict(parse_qsl(parsed.query))

    def crawl(self, url=None, depth=0):
        if url is None:
            url = self.target_url

        # Remove fragment
        url = url.split('#')[0]

        if depth > self.max_depth or url in self.visited:
            return

        self.visited.add(url)
        print(f"Crawling: {url} (Depth: {depth})")

        # Skip static files
        if any(url.lower().endswith(ext) for ext in ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip']):
            return

        try:
            response = requests.get(url, headers=self.headers, timeout=5)
            if response.status_code != 200:
                return
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 1. Extract Links (GET)
            for link in soup.find_all('a', href=True):
                next_url = urljoin(url, link['href']).split('#')[0]
                if self.is_same_domain(next_url):
                    params = self.extract_params_from_url(next_url)
                    base_url = next_url.split('?')[0]
                    
                    endpoint = {
                        "url": base_url,
                        "method": "GET",
                        "type": "link",
                        "params": params
                    }
                    if endpoint not in self.endpoints:
                        self.endpoints.append(endpoint)

                    if next_url not in self.visited:
                        self.crawl(next_url, depth + 1)

            # 2. Extract Forms (POST/GET)
            for form in soup.find_all('form'):
                action = form.get('action') or ''
                form_url = urljoin(url, action).split('#')[0]
                method = (form.get('method') or 'GET').upper()
                
                params = {}
                for input_tag in form.find_all(['input', 'textarea', 'select']):
                    name = input_tag.get('name')
                    if name:
                        val = input_tag.get('value', '')
                        params[name] = val
                
                endpoint = {
                    "url": form_url,
                    "method": method,
                    "type": "form",
                    "params": params
                }
                if endpoint not in self.endpoints and self.is_same_domain(form_url):
                    self.endpoints.append(endpoint)
                    
        except requests.RequestException as e:
            print(f"Error crawling {url}: {e}")

    def get_endpoints(self):
        base_target = self.target_url.split('?')[0]
        params = self.extract_params_from_url(self.target_url)
        initial_endpoint = {
            "url": base_target,
            "method": "GET",
            "type": "link",
            "params": params
        }
        if initial_endpoint not in self.endpoints:
            self.endpoints.insert(0, initial_endpoint)
        return self.endpoints
