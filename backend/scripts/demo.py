from scanner.crawler import Crawler
from scanner.sqli import SQLiScanner
from scanner.xss import XSSScanner

print("="*50)
print("DEMO: WEB SECURITY AI SCANNER ENGINE")
print("="*50)

# Target một trang web cố ý tạo ra để test bảo mật (Ví dụ: public testfire)
TARGET_URL = "http://demo.testfire.net"
print(f"1. Khởi động Crawler thu thập link từ {TARGET_URL}...")
crawler = Crawler(TARGET_URL, max_depth=1)
crawler.crawl()
urls = crawler.get_urls()
print(f"-> Thu thập được {len(urls)} URLs để phân tích.")
print("Danh sách URL mẫu:")
for u in urls[:3]:
    print(f"  - {u}")

print("\n2. Bắt đầu Scanner (SQLi & XSS)...")
sqli = SQLiScanner()
xss = XSSScanner()

# Giả lập quét 3 link đầu tiên
for url in urls[:3]:
    print(f"\n[+] Đang quét mục tiêu: {url}")
    # Thêm dummy param để mô phỏng có tham số nếu url chưa có
    test_url = url if "?" in url else url + "?id=1"
    
    sqli_vulns = sqli.scan(test_url)
    xss_vulns = xss.scan(test_url)
    
    all_vulns = sqli_vulns + xss_vulns
    if all_vulns:
        print(f"!!! PHÁT HIỆN {len(all_vulns)} LỖ HỔNG !!!")
        for v in all_vulns:
            print(f"  -> Loại lỗi: {v['type']} | Mức độ: {v['severity']} | Payload: {v['payload']}")
    else:
        print("  -> An toàn. Không phát hiện lỗi cơ bản.")

print("\n="*50)
print("Hoàn thành quá trình quét Demo!")
print("="*50)
