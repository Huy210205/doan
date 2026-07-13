import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from core.database import SQLALCHEMY_DATABASE_URL

def run():
    print("Connecting to DB...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Adding is_blocked column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("is_blocked column added.")
        except Exception as e:
            print("Column might already exist:", e)

if __name__ == "__main__":
    run()
