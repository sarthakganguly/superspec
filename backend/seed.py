from database import SessionLocal
from models.user import User
from core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        users_to_seed = [
            {"email": "admin@superspec.com", "password": "admin", "role": "ADMIN"},
            {"email": "product@superspec.com", "password": "password", "role": "USER"},
            {"email": "data@superspec.com", "password": "password", "role": "USER"},
            {"email": "qa@superspec.com", "password": "password", "role": "USER"},
            {"email": "viewer@superspec.com", "password": "password", "role": "VIEWER"}
        ]
        
        for u in users_to_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                print(f"Creating user {u['email']}...")
                new_user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                print(f"User created ({u['email']} / {u['password']})")
            else:
                print(f"User {u['email']} already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
