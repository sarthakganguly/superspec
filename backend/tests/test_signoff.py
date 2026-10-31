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
            "name": "Signoff Test Project",
            "business_requirement_owner": "admin@superspec.com",
            "data_dictionary_owner": "admin@superspec.com",
            "user_story_owner": "admin@superspec.com",
            "requirement_sign_off_owner": "admin@superspec.com",
        }
    )
    return response.json()["id"]

def test_signoff_gate1(auth_headers, project_id):
    # Gate 1 doesn't have strict cross-validation requirements for signoff in MVP
    response = client.post(
        f"/api/projects/{project_id}/signoff",
        headers=auth_headers,
        json={"gate_name": "Business Requirements"}
    )
    assert response.status_code == 200
    assert response.json()["gate_name"] == "Business Requirements"
    assert response.json()["artifact_hash"] == "N/A"

def test_signoff_duplicate(auth_headers, project_id):
    client.post(
        f"/api/projects/{project_id}/signoff",
        headers=auth_headers,
        json={"gate_name": "Gate 2"}
    )
    
    response = client.post(
        f"/api/projects/{project_id}/signoff",
        headers=auth_headers,
        json={"gate_name": "Gate 2"}
    )
    assert response.status_code == 400
    assert "already signed off" in response.json()["detail"]

def test_signoff_traceability_invalid(auth_headers, project_id):
    # Empty artifacts means traceability fails
    response = client.post(
        f"/api/projects/{project_id}/signoff",
        headers=auth_headers,
        json={"gate_name": "Traceability"}
    )
    assert response.status_code == 400
    assert "Traceability errors" in response.json()["detail"]
