import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from core.database import SQLALCHEMY_DATABASE_URL
from core.auth import get_password_hash

def run():
    print("Connecting to DB...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Adding role column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';"))
            conn.commit()
            print("Role column added.")
        except Exception as e:
            print("Column might already exist:", e)
            
        print("Checking if admin exists...")
        result = conn.execute(text("SELECT id FROM users WHERE email='admin@test.com'")).fetchone()
        if not result:
            print("Creating admin user...")
            hashed_pwd = get_password_hash("admin123")
            conn.execute(text(f"""
                INSERT INTO users (email, username, hashed_password, role, is_verified, created_at)
                VALUES ('admin@test.com', 'System Admin', '{hashed_pwd}', 'admin', true, NOW())
            """))
            conn.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists, updating role...")
            conn.execute(text("UPDATE users SET role='admin', is_verified=true WHERE email='admin@test.com'"))
            conn.commit()
            print("Admin user updated.")

if __name__ == "__main__":
    run()
