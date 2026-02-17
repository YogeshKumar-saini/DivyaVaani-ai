import sys
import os
from sqlalchemy import create_engine, text

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from src.settings import settings

def update_schema():
    print("Updating database schema...")
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found in environment.")
        return

    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        try:
            # Check if columns exist
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='reset_pass_token'"))
            if result.fetchone():
                print("Column 'reset_pass_token' already exists.")
            else:
                print("Adding column 'reset_pass_token'...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_pass_token VARCHAR(255)"))
                conn.commit()

            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='reset_pass_token_expire'"))
            if result.fetchone():
                print("Column 'reset_pass_token_expire' already exists.")
            else:
                print("Adding column 'reset_pass_token_expire'...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_pass_token_expire TIMESTAMP WITH TIME ZONE"))
                conn.commit()
                
            print("Schema update completed successfully.")
            
        except Exception as e:
            print(f"Error updating schema: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    # Load env from backend/.env
    backend_dir = os.path.join(os.getcwd(), 'backend')
    load_dotenv(os.path.join(backend_dir, '.env'))
    
    update_schema()
