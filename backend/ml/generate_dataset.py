import pandas as pd
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset.csv')

def generate_sqli():
    err_match = random.choices([1, 0], weights=[0.8, 0.2])[0]
    res_time = random.randint(100, 5000)
    sev = 3 if err_match == 1 or res_time > 2000 else 2
    return {
        'vuln_type': 0,
        'payload_length': random.randint(10, 150),
        'has_special_chars': 1,
        'response_status': random.choices([500, 200, 404], weights=[0.8, 0.15, 0.05])[0],
        'response_time_ms': res_time,
        'content_length_diff': random.randint(50, 1000),
        'error_keyword_match': err_match,
        'severity': sev
    }

def generate_xss():
    cl_diff = random.randint(10, 500)
    sev = 2 if cl_diff > 30 else 1
    return {
        'vuln_type': 1,
        'payload_length': random.randint(15, 80),
        'has_special_chars': 1,
        'response_status': random.choices([200, 500, 403], weights=[0.9, 0.05, 0.05])[0],
        'response_time_ms': random.randint(50, 300),
        'content_length_diff': cl_diff,
        'error_keyword_match': random.choices([1, 0], weights=[0.05, 0.95])[0],
        'severity': sev
    }

def generate_csrf():
    return {
        'vuln_type': 2,
        'payload_length': random.randint(0, 5),
        'has_special_chars': 0,
        'response_status': random.choices([200, 403, 401], weights=[0.5, 0.4, 0.1])[0],
        'response_time_ms': random.randint(50, 200),
        'content_length_diff': random.randint(0, 50),
        'error_keyword_match': 0,
        'severity': random.choices([1, 2], weights=[0.6, 0.4])[0]
    }

def generate_lfi():
    cl_diff = random.randint(100, 5000)
    sev = 3 if cl_diff > 1000 else 2
    return {
        'vuln_type': 3,
        'payload_length': random.randint(15, 60),
        'has_special_chars': 1,
        'response_status': random.choices([200, 404, 500], weights=[0.7, 0.2, 0.1])[0],
        'response_time_ms': random.randint(100, 800),
        'content_length_diff': cl_diff,
        'error_keyword_match': random.choices([1, 0], weights=[0.3, 0.7])[0],
        'severity': sev
    }

def generate_safe():
    return {
        'vuln_type': random.choice([0, 1, 2, 3]), 
        'payload_length': random.randint(0, 20),
        'has_special_chars': random.choices([0, 1], weights=[0.9, 0.1])[0],
        'response_status': random.choices([200, 404, 403, 400], weights=[0.6, 0.2, 0.1, 0.1])[0],
        'response_time_ms': random.randint(20, 200),
        'content_length_diff': random.randint(0, 10),
        'error_keyword_match': 0,
        'severity': 0
    }

print("Creating dataset with 7500 rows...")
data = []
for _ in range(1500):
    data.append(generate_sqli())
    data.append(generate_xss())
    data.append(generate_csrf())
    data.append(generate_lfi())
    data.append(generate_safe())

df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)
df.to_csv(DATASET_PATH, index=False)
print(f"Created dataset.csv with {len(df)} records at {DATASET_PATH}")
