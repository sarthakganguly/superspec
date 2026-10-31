from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.project import Project, Artifact
from models.signoff import Signoff
from models.user import User
from api.auth import get_current_user, RequireProjectRole
from services.export import generate_export_zip

router = APIRouter()

@router.get("/{project_id}/export")
def download_export(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequireProjectRole())
):
    """
    Download the project artifacts as a ZIP file (containing action_items.md).
    Requires the project to have a Traceability sign-off.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from models.project import ProjectMember
    
    # Verify that Traceability is signed off by all members (distinct users)
    member_count = db.query(ProjectMember.user_id).filter(ProjectMember.project_id == project_id).distinct().count()
    signoff_count = db.query(Signoff).filter(
        Signoff.project_id == project_id,
        Signoff.gate_name == "Traceability"
    ).count()
    
    if signoff_count < member_count or member_count == 0:
        raise HTTPException(
            status_code=403, 
            detail=f"Cannot export. Pending signatures ({signoff_count}/{member_count})."
        )

    artifacts = db.query(Artifact).filter(Artifact.project_id == project_id).all()
    
    zip_buffer = generate_export_zip(project.name, artifacts)
    
    filename = f"{project.name.lower().replace(' ', '_')}_export.zip"
    
    return StreamingResponse(
        zip_buffer, 
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
