from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from models.schema import Base
from api import auth, scan

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Web Security AI Scanner API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khai báo các module router (Clean Architecture)
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(scan.router, prefix="/api", tags=["Scanner"])

import json
import os

@app.get("/")
def read_root():
    return {"message": "Welcome to AI WebSec API Server"}

@app.get("/api/ai/metrics")
def get_ai_metrics():
    metrics_path = os.path.join(os.path.dirname(__file__), 'ml', 'metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
    return {"error": "Metrics not found"}
