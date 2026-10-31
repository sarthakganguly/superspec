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
            "name": "Artifact Test Project",
            "description": "Testing artifacts",
            "business_requirement_owner": "admin@superspec.com",
            "data_dictionary_owner": "admin@superspec.com",
            "user_story_owner": "admin@superspec.com",
            "requirement_sign_off_owner": "admin@superspec.com",
        }
    )
    return response.json()["id"]

def test_upsert_business_requirements_success(auth_headers, project_id):
    payload = {
        "problem_statement": "This is a sufficiently long problem statement.",
        "target_audience": "Internal employees",
        "success_metrics": ["Adoption rate > 80%"],
        "in_scope": ["Web app", "API"],
        "out_of_scope": ["Mobile app"]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/business-requirements",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 200
    assert response.json()["artifact_type"] == "business-requirements"
    assert response.json()["content"]["problem_statement"] == payload["problem_statement"]

def test_upsert_business_requirements_invalid(auth_headers, project_id):
    payload = {
        "problem_statement": "Too short", # min_length is 10
        "target_audience": "Internal",
        "success_metrics": [], # min_items is 1
        "in_scope": ["Web app"]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/business-requirements",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 422 # Unprocessable Entity
    errors = response.json()["detail"]
    
    # Verify we got validation errors for both fields
    error_locs = [err["loc"][-1] for err in errors]
    assert "problem_statement" in error_locs
    assert "success_metrics" in error_locs

def test_get_artifact(auth_headers, project_id):
    # First create it
    payload = {
        "problem_statement": "This is a sufficiently long problem statement.",
        "target_audience": "Internal employees",
        "success_metrics": ["Adoption rate > 80%"],
        "in_scope": ["Web app", "API"]
    }
    client.put(
        f"/api/projects/{project_id}/artifacts/business-requirements",
        headers=auth_headers,
        json=payload
    )
    
    # Then get it
    response = client.get(
        f"/api/projects/{project_id}/artifacts/business-requirements",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["content"]["target_audience"] == "Internal employees"

def test_get_artifact_not_found(auth_headers, project_id):
    response = client.get(
        f"/api/projects/{project_id}/artifacts/non-existent",
        headers=auth_headers
    )
    assert response.status_code == 404

def test_upsert_data_dictionary_success(auth_headers, project_id):
    payload = {
        "entities": [
            {
                "name": "User",
                "attributes": [
                    {"name": "id", "type": "UUID", "nullable": False, "description": "Primary key"},
                    {"name": "email", "type": "String", "nullable": False, "description": "Email address"}
                ]
            }
        ]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/data-dictionary",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 200
    assert response.json()["artifact_type"] == "data-dictionary"
    assert response.json()["content"]["entities"][0]["name"] == "User"

def test_upsert_data_dictionary_invalid(auth_headers, project_id):
    payload = {
        "entities": [
            {
                "name": "", # min_length is 1
                "attributes": [] # min_length is 1
            }
        ]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/data-dictionary",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 422
    errors = response.json()["detail"]
    error_locs = [err["loc"][-1] for err in errors]
    assert "name" in error_locs
    assert "attributes" in error_locs

def test_upsert_user_stories_success(auth_headers, project_id):
    payload = {
        "stories": [
            {
                "title": "User Login",
                "description": "As a user I want to log in so I can access my account",
                "given": "I am on the login page",
                "when": "I enter valid credentials",
                "then": "I am redirected to the dashboard",
                "complexity": 3
            }
        ]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/user-stories",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 200
    assert response.json()["artifact_type"] == "user-stories"
    assert response.json()["content"]["stories"][0]["title"] == "User Login"

def test_upsert_user_stories_invalid(auth_headers, project_id):
    payload = {
        "stories": [
            {
                "title": "Shor", # min 5
                "description": "Short", # min 10
                "given": "", # min 1
                "when": "", # min 1
                "then": "", # min 1
                "complexity": 20 # max 13
            }
        ]
    }
    
    response = client.put(
        f"/api/projects/{project_id}/artifacts/user-stories",
        headers=auth_headers,
        json=payload
    )
    
    assert response.status_code == 422
    errors = response.json()["detail"]
    error_locs = [err["loc"][-1] for err in errors]
    assert "title" in error_locs
    assert "description" in error_locs
    assert "given" in error_locs
    assert "when" in error_locs
    assert "then" in error_locs
    assert "complexity" in error_locs
