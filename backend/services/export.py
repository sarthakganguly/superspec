import io
import zipfile
import json
from datetime import datetime

def generate_export_zip(project_name: str, artifacts: list) -> io.BytesIO:
    """
    Generate a ZIP file containing markdown exports of the requirements.
    """
    zip_buffer = io.BytesIO()
    
    # Map artifacts for easier access
    artifact_map = {a.artifact_type: a.content for a in artifacts}
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # 1. Raw JSON dump for machine readability
        raw_data = json.dumps(artifact_map, indent=2)
        zip_file.writestr(f"{project_name.lower().replace(' ', '_')}_raw.json", raw_data)
        
        # 2. Generate Action Items Markdown (Gate 3 -> Jira tickets)
        gate3 = artifact_map.get("user-stories", {})
        stories = gate3.get("stories", [])
        
        md_content = f"# Action Items for {project_name}\n\n"
        md_content += f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n"
        
        if not stories:
            md_content += "*No user stories found.*"
        else:
            for idx, story in enumerate(stories, 1):
                md_content += f"## Ticket {idx}: {story.get('title', 'Untitled')}\n\n"
                md_content += f"**Complexity (Story Points):** {story.get('complexity', 1)}\n\n"
                md_content += f"### Description\n{story.get('description', '')}\n\n"
                md_content += "### Acceptance Criteria\n"
                md_content += f"**GIVEN** {story.get('given', '')}\n\n"
                md_content += f"**WHEN** {story.get('when', '')}\n\n"
                md_content += f"**THEN** {story.get('then', '')}\n\n"
                md_content += "---\n\n"
                
        zip_file.writestr("action_items.md", md_content)
        
    zip_buffer.seek(0)
    return zip_buffer
