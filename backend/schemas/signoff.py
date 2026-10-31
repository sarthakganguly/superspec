from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)
