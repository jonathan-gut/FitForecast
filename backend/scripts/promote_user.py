#!/usr/bin/env python3
"""Utility script to promote a user to admin by email.

Usage:
  python -m backend.scripts.promote_user your-email@example.com
Or run interactively and enter the email when prompted.
"""
import sys
from backend.db import SessionLocal
from backend.models import User

def promote(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user:
            print(f"User not found: {email}")
            return 2
        user.role = "admin"
        db.commit()
        print(f"Promoted {email} to admin.")
        return 0
    except Exception as e:
        db.rollback()
        print(f"Error promoting user: {e}")
        return 3
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        email = input("Email to promote to admin: ").strip()
    sys.exit(promote(email))
