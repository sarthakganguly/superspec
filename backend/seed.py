from database import SessionLocal
from models.user import User
from core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@superspec.com").first()
        if not admin:
            print("Creating default admin user...")
            admin = User(
                email="admin@superspec.com",
                hashed_password=get_password_hash("admin"),
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created (admin@superspec.com / admin)")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
