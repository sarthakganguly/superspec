from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db
from models.project import Project, Artifact
from models.user import User
from api.auth import get_current_user, RequireProjectRole
from schemas.artifacts import BusinessRequirement, DataDictionary, UserStoriesGate, ArtifactResponse

router = APIRouter()

@router.put("/{project_id}/artifacts/data-dictionary", response_model=ArtifactResponse)
def update_data_dictionary(
    project_id: UUID,
    payload: DataDictionary,
    db: Session = Depends(get_db),
    membership = Depends(RequireProjectRole(["GATE_2_OWNER"])),
):
    """
    Upsert Data Dictionary (Gate 2) for a specific project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifact = db.query(Artifact).filter(
        Artifact.project_id == project_id,
        Artifact.artifact_type == "data-dictionary"
    ).first()

    if artifact:
        artifact.content = payload.model_dump()
        artifact.updated_at = datetime.utcnow()
    else:
        artifact = Artifact(
            project_id=project_id,
            artifact_type="data-dictionary",
            content=payload.model_dump()
        )
        db.add(artifact)
    
    db.commit()
    db.refresh(artifact)
    return artifact

@router.put("/{project_id}/artifacts/business-requirements", response_model=ArtifactResponse)
def update_business_requirements(
    project_id: UUID,
    payload: BusinessRequirement,
    db: Session = Depends(get_db),
    membership = Depends(RequireProjectRole(["GATE_1_OWNER"])),
):
    """
    Upsert Business Requirements (Gate 1) for a specific project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifact = db.query(Artifact).filter(
        Artifact.project_id == project_id,
        Artifact.artifact_type == "business-requirements"
    ).first()

    if artifact:
        artifact.content = payload.model_dump()
        artifact.updated_at = datetime.utcnow()
    else:
        artifact = Artifact(
            project_id=project_id,
            artifact_type="business-requirements",
            content=payload.model_dump()
        )
        db.add(artifact)
    
    db.commit()
    db.refresh(artifact)
    return artifact

@router.put("/{project_id}/artifacts/user-stories", response_model=ArtifactResponse)
def update_user_stories(
    project_id: UUID,
    payload: UserStoriesGate,
    db: Session = Depends(get_db),
    membership = Depends(RequireProjectRole(["GATE_3_OWNER"])),
):
    """
    Upsert User Stories (Gate 3) for a specific project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifact = db.query(Artifact).filter(
        Artifact.project_id == project_id,
        Artifact.artifact_type == "user-stories"
    ).first()

    if artifact:
        artifact.content = payload.model_dump()
        artifact.updated_at = datetime.utcnow()
    else:
        artifact = Artifact(
            project_id=project_id,
            artifact_type="user-stories",
            content=payload.model_dump()
        )
        db.add(artifact)
    
    db.commit()
    db.refresh(artifact)
    return artifact


@router.get("/{project_id}/artifacts/{artifact_type}", response_model=ArtifactResponse)
def get_artifact(
    project_id: UUID,
    artifact_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific artifact by project and type.
    """
    artifact = db.query(Artifact).filter(
        Artifact.project_id == project_id,
        Artifact.artifact_type == artifact_type
    ).first()
    
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
        
    return artifact
