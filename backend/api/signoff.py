import json
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db
from models.project import Project, Artifact
from models.signoff import Signoff
from models.user import User
from api.auth import get_current_user, RequireProjectRole
from schemas.signoff import SignoffCreate, SignoffResponse
from services.traceability import analyze_traceability

router = APIRouter()

@router.post("/{project_id}/signoff", response_model=SignoffResponse)
def signoff_project(
    project_id: UUID,
    payload: SignoffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequireProjectRole())
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if already signed off for this gate by THIS user
    existing = db.query(Signoff).filter(
        Signoff.project_id == project_id,
        Signoff.gate_name == payload.gate_name,
        Signoff.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"You have already signed off for {payload.gate_name}")

    # For Traceability gate, ensure it's valid
    if payload.gate_name == "Traceability":
        artifacts = db.query(Artifact).filter(Artifact.project_id == project_id).all()
        artifact_map = {a.artifact_type: a.content for a in artifacts}
        report = analyze_traceability(
            artifact_map.get("business-requirements"),
            artifact_map.get("data-dictionary"),
            artifact_map.get("user-stories")
        )
        if not report["is_valid"]:
            raise HTTPException(status_code=400, detail="Cannot sign off. Traceability errors must be fixed.")
            
        # Hash all artifacts for the baseline signature
        # Convert SQLAlchemy models to dicts
        artifact_list = [
            {
                "artifact_type": a.artifact_type,
                "content": a.content,
                "updated_at": a.updated_at.isoformat()
            }
            for a in artifacts
        ]
        sorted_artifacts = sorted(artifact_list, key=lambda x: x["artifact_type"])
        # Stringify safely for hashing
        dumped = json.dumps(sorted_artifacts, sort_keys=True)
        artifact_hash = hashlib.sha256(dumped.encode("utf-8")).hexdigest()
    else:
        # Generic fallback
        artifact_hash = "N/A"

    from sqlalchemy.exc import IntegrityError

    signoff = Signoff(
        project_id=project_id,
        user_id=current_user.id,
        gate_name=payload.gate_name,
        artifact_hash=artifact_hash
    )
    db.add(signoff)
    try:
        db.commit()
        db.refresh(signoff)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Signoff already exists for this user and gate.")
    
    return signoff

@router.get("/{project_id}/signoffs", response_model=list[SignoffResponse])
def get_signoffs(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequireProjectRole())
):
    signoffs = db.query(Signoff).filter(Signoff.project_id == project_id).all()
    return signoffs
