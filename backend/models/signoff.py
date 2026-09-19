from sqlalchemy import Column, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Signoff(Base):
    __tablename__ = "signoffs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    gate_name = Column(String, nullable=False) # e.g. "Traceability"
    artifact_hash = Column(String, nullable=False) # SHA-256 hash of the baselined state
    signed_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', 'gate_name', name='uq_project_user_gate_signoff'),
    )

    project = relationship("Project")
    user = relationship("User")
