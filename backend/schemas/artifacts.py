from pydantic import BaseModel, Field, ConfigDict
from typing import List
from uuid import UUID
from datetime import datetime

class BusinessRequirement(BaseModel):
    problem_statement: str = Field(..., min_length=10, description="The core problem this project solves")
    target_audience: str = Field(..., min_length=5)
    success_metrics: List[str] = Field(..., min_length=1, description="List of KPIs or success metrics")
    in_scope: List[str] = Field(..., min_length=1)
    out_of_scope: List[str] = Field(default_factory=list)

class EntityAttribute(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = Field(..., min_length=1)
    nullable: bool = False
    description: str = ""

class Entity(BaseModel):
    name: str = Field(..., min_length=1)
    attributes: List[EntityAttribute] = Field(..., min_length=1)

class DataDictionary(BaseModel):
    entities: List[Entity] = Field(..., min_length=1, description="List of domain entities")

class UserStory(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=10)
    given: str = Field(..., min_length=1)
    when: str = Field(..., min_length=1)
    then: str = Field(..., min_length=1)
    complexity: int = Field(default=1, ge=1, le=13)

class UserStoriesGate(BaseModel):
    stories: List[UserStory] = Field(..., min_length=1)

class ArtifactResponse(BaseModel):
    id: UUID
    project_id: UUID
    artifact_type: str
    content: dict
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
