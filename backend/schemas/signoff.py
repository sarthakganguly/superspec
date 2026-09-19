from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class SignoffCreate(BaseModel):
    gate_name: str

class SignoffResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    gate_name: str
    artifact_hash: str
    signed_at: datetime

    class Config:
        from_attributes = True
