from datetime import timedelta
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import ValidationError

from database import get_db
from core.config import settings
from core.security import verify_password, create_access_token, get_password_hash
from models.user import User
from schemas.user import Token, UserResponse, TokenPayload, UserCreate

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

from fastapi.security import OAuth2PasswordBearer
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current user.
    """
    return current_user

@router.get("/users", response_model=List[UserResponse])
def search_users(
    q: Optional[str] = Query(None, description="Search substring for user email"),
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[User]:
    """
    Search registered users by email substring or list all users for admin.
    """
    if q is None:
        if current_user.role == "ADMIN":
            return db.query(User).order_by(User.email.asc()).limit(limit).all()
        return []

    query_str = q.strip()
    if len(query_str) < 3:
        return []

    users = (
        db.query(User)
        .filter(User.email.ilike(f"%{query_str}%"))
        .order_by(User.email.asc())
        .limit(limit)
        .all()
    )
    return users

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Provision a new user account.
    Requires global platform administrator (ADMIN) privileges.
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires platform administrator privileges",
        )

    email_clean = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    allowed_roles = {"ADMIN", "USER", "VIEWER"}
    role_to_assign = user_in.role.upper() if user_in.role else "USER"
    if role_to_assign not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}",
        )

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(user_in.password),
        role=role_to_assign,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a user account.
    Requires global platform administrator (ADMIN) privileges.
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires platform administrator privileges",
        )

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrator account",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_protected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete system default user account '{user.email}'",
        )

    from models.signoff import Signoff
    has_signoffs = db.query(Signoff).filter(Signoff.user_id == user_id).first()
    if has_signoffs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user who has recorded cryptographic sign-offs in project baselines",
        )

    from models.project import ProjectMember
    db.query(ProjectMember).filter(ProjectMember.user_id == user_id).delete()

    db.delete(user)
    db.commit()
    return None

from models.project import ProjectMember
from schemas.project import ProjectRole

class RequireProjectRole:
    def __init__(self, allowed_roles: list[str] = None):
        self.allowed_roles = allowed_roles or []
        
    def __call__(self, project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        if current_user.role == "ADMIN":
            return ProjectMember(project_id=project_id, user_id=current_user.id, role=ProjectRole.PROJECT_ADMIN.value)
            
        members = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).all()
        
        if not members:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this project")
            
        user_roles = {m.role for m in members}
        if ProjectRole.PROJECT_ADMIN.value in user_roles:
            return members[0]
            
        if self.allowed_roles:
            if not any(r in self.allowed_roles for r in user_roles):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Requires one of roles: {', '.join(self.allowed_roles)}")
            
        return members[0]
