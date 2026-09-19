from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

from enum import Enum

class ProjectRole(str, Enum):
    PROJECT_ADMIN = "PROJECT_ADMIN"
    GATE_1_OWNER = "GATE_1_OWNER"
    GATE_2_OWNER = "GATE_2_OWNER"
    GATE_3_OWNER = "GATE_3_OWNER"
    REVIEWER = "REVIEWER"

class ProjectMemberCreate(BaseModel):
    email: str
    role: ProjectRole

class ProjectMemberResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    email: str
    role: ProjectRole
    joined_at: datetime

    class Config:
        from_attributes = True
