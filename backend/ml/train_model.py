import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')

# Đường dẫn file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'rf_model.pkl')

print("1. Đọc dữ liệu từ dataset...")
df = pd.read_csv(DATASET_PATH)

# Tách Features (X) và Label (y)
features = ['vuln_type', 'payload_length', 'has_special_chars', 'response_status', 
            'response_time_ms', 'content_length_diff', 'error_keyword_match']
X = df[features]
y = df['severity']

# Chia tập train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("2. Đang tinh chỉnh siêu tham số mô hình với GridSearchCV...")
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}

rf = RandomForestClassifier(random_state=42, class_weight='balanced')
grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, scoring='accuracy')
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"-> Tham số tốt nhất: {grid_search.best_params_}")

# Đánh giá độ chính xác
y_pred = best_model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"-> Độ chính xác của mô hình trên tập test (dữ liệu mẫu): {acc * 100:.2f}%")

# Lấy Feature Importances
importances = best_model.feature_importances_
feature_importance_dict = {feat: round(float(imp), 4) for feat, imp in zip(features, importances)}
# Sắp xếp từ cao xuống thấp
feature_importance_dict = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))

# Lưu mô hình
print(f"3. Lưu mô hình vào file {MODEL_PATH}...")
joblib.dump(best_model, MODEL_PATH)

metrics = {
    "accuracy": acc,
    "dataset_size": len(df),
    "features_used": features,
    "best_params": grid_search.best_params_,
    "feature_importances": feature_importance_dict
}
with open(os.path.join(BASE_DIR, 'metrics.json'), 'w') as f:
    json.dump(metrics, f, indent=4)
print("Hoàn tất huấn luyện!")
