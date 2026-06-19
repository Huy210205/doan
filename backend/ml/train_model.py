import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
# pyrefly: ignore [missing-import]
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore') # Ẩn các warning của scikit-learn

# Đường dẫn file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'rf_model.pkl')

print("1. Đọc dữ liệu từ dataset...")
df = pd.read_csv(DATASET_PATH)

# Tách Features (X) và Label (y)
X = df[['vuln_type', 'payload_length', 'has_special_chars', 'response_status']]
y = df['severity']

# Chia tập train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("2. Đang huấn luyện mô hình Random Forest...")
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Đánh giá độ chính xác
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"-> Độ chính xác của mô hình trên tập test (dữ liệu mẫu): {acc * 100:.2f}%")

# Lưu mô hình
print(f"3. Lưu mô hình vào file {MODEL_PATH}...")
joblib.dump(model, MODEL_PATH)

metrics = {
    "accuracy": acc,
    "dataset_size": len(df),
    "features_used": list(X.columns)
}
with open(os.path.join(BASE_DIR, 'metrics.json'), 'w') as f:
    json.dump(metrics, f, indent=4)
print("Hoàn tất huấn luyện!")
