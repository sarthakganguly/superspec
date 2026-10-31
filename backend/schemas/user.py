from pydantic import BaseModel, EmailStr, ConfigDict, Field
from uuid import UUID

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    role: str = "USER"

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=6)

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: str | None = None

# Properties to return via API
class UserResponse(UserBase):
    id: UUID
    is_protected: bool = False
    model_config = ConfigDict(from_attributes=True)

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str | None = None
