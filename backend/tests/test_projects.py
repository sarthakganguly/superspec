from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def get_auth_headers():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_project():
    headers = get_auth_headers()
    response = client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Test Project", "description": "A project for testing"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Project"
    assert "id" in response.json()

def test_get_projects():
    headers = get_auth_headers()
    response = client.get("/api/projects", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["name"] == "Test Project"

def test_get_project_by_id():
    headers = get_auth_headers()
    projects = client.get("/api/projects", headers=headers).json()
    project_id = projects[0]["id"]
    
    response = client.get(f"/api/projects/{project_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == project_id

def test_create_project_unauthorized():
    response = client.post(
        "/api/projects",
        json={"name": "Hacker Project"}
    )
    assert response.status_code == 401
