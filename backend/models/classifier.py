import joblib
import os
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'rf_model.pkl')

class AIClassifier:
    def __init__(self):
        self.model = None
        self.severity_map = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}
        self.vuln_map = {"SQLi": 0, "XSS": 1, "CSRF": 2, "LFI": 3}
        
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            
    def predict_severity(self, vuln_type_str, payload, response_status):
        if self.model is None:
            return "Unknown"
            
        # Trích xuất các đặc trưng (Feature extraction)
        v_type = self.vuln_map.get(vuln_type_str, 0)
        p_len = len(payload) if payload else 0
        special_chars = 1 if payload and any(c in payload for c in ["'", "\"", "<", ">", "%"]) else 0
        
        # Đưa vào model dự đoán
        features = [[v_type, p_len, special_chars, response_status]]
        pred = self.model.predict(features)[0]
        
        return self.severity_map.get(pred, "Unknown")
