from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.project import Project, Artifact
from models.user import User
from api.auth import get_current_user, RequireProjectRole
from services.traceability import analyze_traceability

router = APIRouter()

@router.get("/{project_id}/traceability")
def get_traceability_report(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequireProjectRole()),
):
    """
    Generate the Requirements Traceability Matrix report.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifacts = db.query(Artifact).filter(Artifact.project_id == project_id).all()
    
    artifact_map = {a.artifact_type: a.content for a in artifacts}
    
    gate1 = artifact_map.get("business-requirements")
    gate2 = artifact_map.get("data-dictionary")
    gate3 = artifact_map.get("user-stories")

    report = analyze_traceability(gate1, gate2, gate3)
    
    return report
