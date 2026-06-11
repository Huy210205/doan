from models.classifier import AIClassifier

print("="*50)
print("DEMO: AI EVALUATOR (Phân loại mức độ nguy hiểm)")
print("="*50)

# Khởi tạo bộ phân loại
classifier = AIClassifier()

if classifier.model is None:
    print("Lỗi: Không tìm thấy file rf_model.pkl. Hãy chạy ml/train_model.py trước.")
    exit(1)

# Các kịch bản giả lập lỗ hổng do Scanner bắt được trả về
scenarios = [
    {"type": "SQLi", "payload": "' OR 1=1--", "status": 500},
    {"type": "XSS", "payload": "<script>alert(1)</script>", "status": 200},
    {"type": "CSRF", "payload": "", "status": 403},
    {"type": "LFI", "payload": "../../../../etc/passwd", "status": 200},
    {"type": "SQLi", "payload": "1", "status": 404} # Test payload rác, không nguy hiểm
]

for s in scenarios:
    severity = classifier.predict_severity(s['type'], s['payload'], s['status'])
    print(f"Phát hiện: {s['type']} | Payload dài: {len(s['payload'])} | Response Code: {s['status']}")
    print(f" => AI đánh giá rủi ro: {severity}")
    print("-" * 30)

print("Demo ML hoàn tất!")
