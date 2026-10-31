from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    business_requirement_owner: EmailStr
    data_dictionary_owner: EmailStr
    user_story_owner: EmailStr
    requirement_sign_off_owner: EmailStr

class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BulkDeleteProjectsRequest(BaseModel):
    project_ids: List[UUID]

class BulkDeleteProjectsResponse(BaseModel):
    deleted_count: int
    deleted_ids: List[UUID]

class ProjectRole(str, Enum):
    PROJECT_ADMIN = "PROJECT_ADMIN"
    BUSINESS_REQUIREMENT_OWNER = "BUSINESS_REQUIREMENT_OWNER"
    DATA_DICTIONARY_OWNER = "DATA_DICTIONARY_OWNER"
    USER_STORY_OWNER = "USER_STORY_OWNER"
    REQUIREMENT_SIGN_OFF_OWNER = "REQUIREMENT_SIGN_OFF_OWNER"
    REVIEWER = "REVIEWER"

    # Backward compatibility aliases
    GATE_1_OWNER = "GATE_1_OWNER"
    GATE_2_OWNER = "GATE_2_OWNER"
    GATE_3_OWNER = "GATE_3_OWNER"
    GATE_5_OWNER = "GATE_5_OWNER"

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
    model_config = ConfigDict(from_attributes=True)
