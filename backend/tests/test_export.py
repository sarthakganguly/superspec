import zipfile
import io
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

@pytest.fixture
def auth_headers():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def project_id(auth_headers):
    response = client.post(
        "/api/projects",
        headers=auth_headers,
        json={
            "name": "Export Test Project",
            "business_requirement_owner": "admin@superspec.com",
            "data_dictionary_owner": "admin@superspec.com",
            "user_story_owner": "admin@superspec.com",
            "requirement_sign_off_owner": "admin@superspec.com",
        }
    )
    return response.json()["id"]

def test_export_without_signoff(auth_headers, project_id):
    response = client.get(
        f"/api/projects/{project_id}/export",
        headers=auth_headers
    )
    assert response.status_code == 403
    assert "Cannot export" in response.json()["detail"]

def test_export_success(auth_headers, project_id):
    # Add fake artifacts so traceability succeeds
    client.put(
        f"/api/projects/{project_id}/artifacts/business-requirements",
        headers=auth_headers,
        json={"problem_statement": "x"*10, "target_audience": "x"*5, "success_metrics": ["x"], "in_scope": ["x"]}
    )
    client.put(
        f"/api/projects/{project_id}/artifacts/data-dictionary",
        headers=auth_headers,
        json={"entities": [{"name": "User", "attributes": [{"name": "id", "type": "str", "nullable": False, "description": ""}]}]}
    )
    client.put(
        f"/api/projects/{project_id}/artifacts/user-stories",
        headers=auth_headers,
        json={"stories": [{"title": "Test User", "description": "x"*10, "given": "x", "when": "x", "then": "x", "complexity": 1}]}
    )

    # Sign off Traceability
    client.post(
        f"/api/projects/{project_id}/signoff",
        headers=auth_headers,
        json={"gate_name": "Traceability"}
    )
    
    # Download Export
    response = client.get(
        f"/api/projects/{project_id}/export",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/x-zip-compressed"
    
    # Verify ZIP contents
    zip_buffer = io.BytesIO(response.content)
    with zipfile.ZipFile(zip_buffer, "r") as zf:
        file_names = zf.namelist()
        assert "action_items.md" in file_names
        assert "export_test_project_raw.json" in file_names
        
        md_content = zf.read("action_items.md").decode("utf-8")
        assert "# Action Items for Export Test Project" in md_content
        assert "Test User" in md_content
