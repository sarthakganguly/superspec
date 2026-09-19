import pytest
from fastapi.testclient import TestClient
from main import app
from models.user import User
from database import SessionLocal

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
def secondary_user():
    db = SessionLocal()
    from core.security import get_password_hash
    user = db.query(User).filter(User.email == "architect@superspec.com").first()
    if not user:
        user = User(email="architect@superspec.com", hashed_password=get_password_hash("password"))
        db.add(user)
        db.commit()
    db.close()
    return "architect@superspec.com"

@pytest.fixture
def project_id(auth_headers):
    response = client.post(
        "/api/projects",
        headers=auth_headers,
        json={"name": "Member Test Project"}
    )
    return response.json()["id"]

def test_project_creator_added_as_members(auth_headers, project_id):
    response = client.get(
        f"/api/projects/{project_id}/members",
        headers=auth_headers
    )
    assert response.status_code == 200
    members = response.json()
    assert len(members) == 1
    assert members[0]["role"] == "PROJECT_ADMIN"

def test_add_project_member(auth_headers, project_id, secondary_user):
    # Add member
    response = client.post(
        f"/api/projects/{project_id}/members",
        headers=auth_headers,
        json={"email": secondary_user, "role": "REVIEWER"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == secondary_user
    assert data["role"] == "REVIEWER"
    
    # Try adding again (should fail with 409 due to unique constraint)
    response = client.post(
        f"/api/projects/{project_id}/members",
        headers=auth_headers,
        json={"email": secondary_user, "role": "GATE_1_OWNER"}
    )
    assert response.status_code == 409

    # Delete member
    user_id = data["user_id"]
    response = client.delete(
        f"/api/projects/{project_id}/members/{user_id}",
        headers=auth_headers
    )
    assert response.status_code == 204

    # Verify deleted
    response = client.get(
        f"/api/projects/{project_id}/members",
        headers=auth_headers
    )
    members = response.json()
    assert len(members) == 1 # Only admin left
