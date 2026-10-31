from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

DEFAULT_SYSTEM_USERS = {
    "admin@superspec.com",
    "product@superspec.com",
    "data@superspec.com",
    "qa@superspec.com",
    "viewer@superspec.com",
}

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="VIEWER", nullable=False)
    is_active = Column(Boolean, default=True)

    @property
    def is_protected(self) -> bool:
        return self.email.lower() in DEFAULT_SYSTEM_USERS
