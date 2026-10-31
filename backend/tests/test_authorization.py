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
    for email in ["admin@superspec.com", "gate1@superspec.com", "reviewer@superspec.com"]:
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
        password = "admin" if email == "admin@superspec.com" else "password"
        response = client.post("/api/auth/login", data={"username": email, "password": password})
        assert response.status_code == 200, f"Login failed for {email}: {response.text}"
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    return _get_header

@pytest.fixture
def project_id(auth_headers):
    # admin creates the project
    response = client.post(
        "/api/projects",
        headers=auth_headers("admin@superspec.com"),
        json={
            "name": "Authz Test Project",
            "business_requirement_owner": "gate1@superspec.com",
            "data_dictionary_owner": "admin@superspec.com",
            "user_story_owner": "admin@superspec.com",
            "requirement_sign_off_owner": "admin@superspec.com",
        }
    )
    proj_id = response.json()["id"]
    
    # assign gate1@superspec.com as GATE_1_OWNER
    client.post(f"/api/projects/{proj_id}/members", headers=auth_headers("admin@superspec.com"), json={"email": "gate1@superspec.com", "role": "GATE_1_OWNER"})
    # assign reviewer@superspec.com as REVIEWER
    client.post(f"/api/projects/{proj_id}/members", headers=auth_headers("admin@superspec.com"), json={"email": "reviewer@superspec.com", "role": "REVIEWER"})
    
    return proj_id

def test_gate1_authz(auth_headers, project_id):
    payload = {"problem_statement": "x"*10, "target_audience": "x"*5, "success_metrics": ["x"], "in_scope": ["x"]}
    
    # 1. Admin can save
    r = client.put(f"/api/projects/{project_id}/artifacts/business-requirements", headers=auth_headers("admin@superspec.com"), json=payload)
    assert r.status_code == 200
    
    # 2. Gate 1 Owner can save
    r = client.put(f"/api/projects/{project_id}/artifacts/business-requirements", headers=auth_headers("gate1@superspec.com"), json=payload)
    assert r.status_code == 200
    
    # 3. Reviewer gets 403
    r = client.put(f"/api/projects/{project_id}/artifacts/business-requirements", headers=auth_headers("reviewer@superspec.com"), json=payload)
    assert r.status_code == 403
    
    # 4. Gate 1 owner trying to save Gate 2 gets 403
    payload2 = {"entities": [{"name": "User", "attributes": [{"name": "id", "type": "str", "nullable": False, "description": ""}]}]}
    r = client.put(f"/api/projects/{project_id}/artifacts/data-dictionary", headers=auth_headers("gate1@superspec.com"), json=payload2)
    assert r.status_code == 403
