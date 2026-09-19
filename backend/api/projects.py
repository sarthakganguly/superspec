from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models.project import Project
from schemas.project import ProjectCreate, ProjectResponse
from models.user import User
from api.auth import get_current_user

router = APIRouter()

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new project.
    """
    project = Project(
        name=project_in.name,
        description=project_in.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Add creator as PROJECT_ADMIN by default
    from models.project import ProjectMember
    from schemas.project import ProjectRole
    db.add(ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role=ProjectRole.PROJECT_ADMIN.value
    ))
    db.commit()

    return project

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all accessible projects.
    """
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific project by ID.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

from schemas.project import ProjectMemberCreate, ProjectMemberResponse
from models.project import ProjectMember
from sqlalchemy.exc import IntegrityError

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
def get_project_members(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all members of a project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    
    # We need to map email into the response manually or via joinedload
    result = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "id": m.id,
            "project_id": m.project_id,
            "user_id": m.user_id,
            "email": user.email if user else "Unknown",
            "role": m.role,
            "joined_at": m.joined_at
        })
    return result

@router.post("/{project_id}/members", response_model=ProjectMemberResponse)
def add_project_member(
    project_id: UUID,
    member_in: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a new member to a project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(User).filter(User.email == member_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with email {member_in.email} not found")
        
    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=member_in.role.value
    )
    
    try:
        db.add(member)
        db.commit()
        db.refresh(member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User is already a member of this project")
        
    return {
        "id": member.id,
        "project_id": member.project_id,
        "user_id": member.user_id,
        "email": user.email,
        "role": member.role,
        "joined_at": member.joined_at
    }

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    project_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a member from a project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Optional: Prevent removing the last member or the creator, but skipped for MVP
    
    # We delete all roles for this user in this project
    deleted = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).delete()
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Member not found in project")
        
    db.commit()
    return None
