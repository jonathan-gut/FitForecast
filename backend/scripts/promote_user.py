import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.db import SessionLocal
from backend.models import User

def promote_user(email):
    """Promote a user to admin role"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User with email '{email}' not found")
            return False
        
        if user.role == 'admin':
            print(f"ℹ️  User '{email}' is already an admin")
            return True
        
        user.role = 'admin'
        db.commit()
        print(f"✅ Successfully promoted '{email}' to admin")
        return True
        
    except Exception as e:
        print(f"❌ Error promoting user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m backend.scripts.promote_user <email>")
        print("Example: python -m backend.scripts.promote_user user@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    success = promote_user(email)
    sys.exit(0 if success else 1)
