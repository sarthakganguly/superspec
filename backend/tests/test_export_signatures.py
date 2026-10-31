import pytest
from fastapi.testclient import TestClient
from main import app
from models.user import User
from database import SessionLocal

client = TestClient(app)

@pytest.fixture
def test_users():
    db = SessionLocal()
    from core.security import get_password_hash
    users = {}
    for email in ["admin2@superspec.com", "member@superspec.com"]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, hashed_password=get_password_hash("password"))
            db.add(user)
            db.commit()
            db.refresh(user)
        users[email] = user
    db.close()
    return users

@pytest.fixture
def auth_headers(test_users):
    def _get_header(email):
        response = client.post("/api/auth/login", data={"username": email, "password": "password"})
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    return _get_header

def test_export_multi_signature(auth_headers):
    # Create project with admin2
    r_proj = client.post(
        "/api/projects",
        headers=auth_headers("admin2@superspec.com"),
        json={
            "name": "Multi Sig Project",
            "business_requirement_owner": "admin2@superspec.com",
            "data_dictionary_owner": "admin2@superspec.com",
            "user_story_owner": "admin2@superspec.com",
            "requirement_sign_off_owner": "admin2@superspec.com",
        }
    )
    assert r_proj.status_code == 201
    project_id = r_proj.json()["id"]

    # Add member
    r_member = client.post(f"/api/projects/{project_id}/members", headers=auth_headers("admin2@superspec.com"), json={"email": "member@superspec.com", "role": "REVIEWER"})
    assert r_member.status_code == 200

    # Gate 1, 2, 3 data to pass traceability
    client.put(f"/api/projects/{project_id}/artifacts/business-requirements", headers=auth_headers("admin2@superspec.com"), json={
        "problem_statement": "Valid length problem statement",
        "target_audience": "Users",
        "success_metrics": ["Metric 1"],
        "in_scope": ["Scope 1"]
    })
    client.put(f"/api/projects/{project_id}/artifacts/data-dictionary", headers=auth_headers("admin2@superspec.com"), json={
        "entities": [{"name": "User", "attributes": [{"name": "id", "type": "String", "nullable": False, "description": ""}]}]
    })
    client.put(f"/api/projects/{project_id}/artifacts/user-stories", headers=auth_headers("admin2@superspec.com"), json={
        "stories": [{"title": "User Auth", "description": "As a user I can login", "given": "user", "when": "user", "then": "user", "complexity": 3}]
    })

    # Try export - should be 403
    r_export1 = client.get(f"/api/projects/{project_id}/export", headers=auth_headers("admin2@superspec.com"))
    assert r_export1.status_code == 403
    assert "Pending signatures (0/2)" in r_export1.text

    # Admin signs off
    r_sign1 = client.post(f"/api/projects/{project_id}/signoff", headers=auth_headers("admin2@superspec.com"), json={"gate_name": "Traceability"})
    assert r_sign1.status_code == 200

    # Try export again - should be 403
    r_export2 = client.get(f"/api/projects/{project_id}/export", headers=auth_headers("admin2@superspec.com"))
    assert r_export2.status_code == 403
    assert "Pending signatures (1/2)" in r_export2.text

    # Member signs off
    r_sign2 = client.post(f"/api/projects/{project_id}/signoff", headers=auth_headers("member@superspec.com"), json={"gate_name": "Traceability"})
    assert r_sign2.status_code == 200

    # Try export again - should be 200
    r_export3 = client.get(f"/api/projects/{project_id}/export", headers=auth_headers("admin2@superspec.com"))
    assert r_export3.status_code == 200

    # Add another member - should relock
    # To add member, wait, create user3
    db = SessionLocal()
    from core.security import get_password_hash
    user3 = db.query(User).filter(User.email == "member3@superspec.com").first()
    if not user3:
        user3 = User(email="member3@superspec.com", hashed_password=get_password_hash("password"))
        db.add(user3)
        db.commit()
    db.close()
    
    r_member3 = client.post(f"/api/projects/{project_id}/members", headers=auth_headers("admin2@superspec.com"), json={"email": "member3@superspec.com", "role": "REVIEWER"})
    assert r_member3.status_code == 200

    r_export4 = client.get(f"/api/projects/{project_id}/export", headers=auth_headers("admin2@superspec.com"))
    assert r_export4.status_code == 403
    assert "Pending signatures (2/3)" in r_export4.text
