import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

class Crawler:
    def __init__(self, target_url, max_depth=2):
        self.target_url = target_url
        self.max_depth = max_depth
        self.visited = set()
        self.urls_to_scan = []

    def is_same_domain(self, url):
        return urlparse(self.target_url).netloc == urlparse(url).netloc

    def crawl(self, url=None, depth=0):
        if url is None:
            url = self.target_url

        if depth > self.max_depth or url in self.visited:
            return

        self.visited.add(url)
        self.urls_to_scan.append(url)
        
        print(f"Crawling: {url} (Depth: {depth})")

        try:
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                return
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for link in soup.find_all('a', href=True):
                next_url = urljoin(url, link['href'])
                
                if next_url not in self.visited and self.is_same_domain(next_url):
                    self.crawl(next_url, depth + 1)
                    
        except requests.RequestException as e:
            print(f"Error crawling {url}: {e}")

    def get_urls(self):
        return self.urls_to_scan
