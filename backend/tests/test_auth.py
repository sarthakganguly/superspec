from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_failure():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"

def test_read_users_me_success():
    # Login first
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    token = login_response.json()["access_token"]
    
    # Use token
    response = client.get(
        "/api/auth/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "admin@superspec.com"

def test_read_users_me_unauthorized():
    response = client.get("/api/auth/users/me")
    assert response.status_code == 401

def test_search_users_short_query():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Query with 2 chars should return empty list
    res = client.get("/api/auth/users?q=ad", headers=headers)
    assert res.status_code == 200
    assert res.json() == []

    # Query with empty string should return empty list
    res_empty = client.get("/api/auth/users?q=", headers=headers)
    assert res_empty.status_code == 200
    assert res_empty.json() == []

def test_search_users_matching():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/auth/users?q=admin", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any(u["email"] == "admin@superspec.com" for u in data)

    res_prod = client.get("/api/auth/users?q=product", headers=headers)
    assert res_prod.status_code == 200
    prod_data = res_prod.json()
    assert len(prod_data) >= 1
    assert any(u["email"] == "product@superspec.com" for u in prod_data)

def test_search_users_unauthorized():
    res = client.get("/api/auth/users?q=admin")
    assert res.status_code == 401

def test_admin_create_user_success():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    new_email = "new_provisioned_user@superspec.com"
    create_res = client.post(
        "/api/auth/users",
        headers=headers,
        json={"email": new_email, "password": "securepassword123", "role": "USER"},
    )
    assert create_res.status_code == 201
    created_user = create_res.json()
    assert created_user["email"] == new_email
    assert created_user["role"] == "USER"
    assert "id" in created_user

    # Verify newly created user can log in
    new_login = client.post(
        "/api/auth/login",
        data={"username": new_email, "password": "securepassword123"},
    )
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()

    # Clean up test user
    from database import SessionLocal
    from models.user import User
    db = SessionLocal()
    db.query(User).filter(User.email == new_email).delete()
    db.commit()
    db.close()

def test_admin_create_user_duplicate_email():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Attempt to create existing admin email
    res = client.post(
        "/api/auth/users",
        headers=headers,
        json={"email": "admin@superspec.com", "password": "password123", "role": "USER"},
    )
    assert res.status_code == 400
    assert "Email already registered" in res.json()["detail"]

def test_admin_create_user_forbidden_for_non_admin():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "viewer@superspec.com", "password": "password"},
    )
    viewer_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {viewer_token}"}

    res = client.post(
        "/api/auth/users",
        headers=headers,
        json={"email": "hacker@superspec.com", "password": "password123", "role": "ADMIN"},
    )
    assert res.status_code == 403

def test_admin_create_user_unauthorized():
    res = client.post(
        "/api/auth/users",
        json={"email": "unauthorized@superspec.com", "password": "password123"},
    )
    assert res.status_code == 401

def test_admin_create_user_short_password():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.post(
        "/api/auth/users",
        headers=headers,
        json={"email": "shortpass@superspec.com", "password": "123", "role": "USER"},
    )
    assert res.status_code == 422

def test_admin_list_all_users():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Calling /api/auth/users with no query parameter returns full list for admin
    res = client.get("/api/auth/users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    emails = [u["email"] for u in data]
    assert "admin@superspec.com" in emails

def test_non_admin_cannot_list_all_users():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "viewer@superspec.com", "password": "password"},
    )
    viewer_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {viewer_token}"}

    # Calling /api/auth/users with no query parameter returns empty list for non-admin
    res = client.get("/api/auth/users", headers=headers)
    assert res.status_code == 200
    assert res.json() == []

def test_admin_delete_user_success():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # First provision a disposable user
    temp_email = "disposable_user@superspec.com"
    create_res = client.post(
        "/api/auth/users",
        headers=headers,
        json={"email": temp_email, "password": "password123", "role": "USER"},
    )
    assert create_res.status_code == 201
    user_id = create_res.json()["id"]

    # Delete the disposable user
    del_res = client.delete(f"/api/auth/users/{user_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify user is gone
    from database import SessionLocal
    from models.user import User
    db = SessionLocal()
    found = db.query(User).filter(User.id == user_id).first()
    db.close()
    assert found is None

def test_admin_cannot_delete_self():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Get admin user ID
    me_res = client.get("/api/auth/users/me", headers=headers)
    my_id = me_res.json()["id"]

    # Attempt self-deletion
    del_res = client.delete(f"/api/auth/users/{my_id}", headers=headers)
    assert del_res.status_code == 400
    assert "Cannot delete your own administrator account" in del_res.json()["detail"]

def test_admin_cannot_delete_default_users():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    default_emails = [
        "product@superspec.com",
        "data@superspec.com",
        "qa@superspec.com",
        "viewer@superspec.com",
    ]

    from database import SessionLocal
    from models.user import User
    db = SessionLocal()
    for email in default_emails:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.is_protected is True
        del_res = client.delete(f"/api/auth/users/{user.id}", headers=headers)
        assert del_res.status_code == 400
        assert "Cannot delete system default user account" in del_res.json()["detail"]
    db.close()


def test_admin_cannot_delete_user_with_signoffs():
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    from database import SessionLocal
    from models.user import User
    from models.signoff import Signoff
    from models.project import Project
    import uuid

    db = SessionLocal()
    from core.security import get_password_hash
    unique_email = f"signed_user_{uuid.uuid4().hex[:8]}@superspec.com"
    signed_user = User(email=unique_email, hashed_password=get_password_hash("pass"), role="USER")
    db.add(signed_user)
    db.commit()
    db.refresh(signed_user)

    signoff = None
    try:
        project = db.query(Project).first()
        if project:
            signoff = Signoff(
                project_id=project.id,
                user_id=signed_user.id,
                gate_name=f"Gate_{uuid.uuid4().hex[:6]}",
                artifact_hash="dummyhash123",
            )
            db.add(signoff)
            db.commit()

            # Attempt to delete user with signoff
            del_res = client.delete(f"/api/auth/users/{signed_user.id}", headers=headers)
            assert del_res.status_code == 400
            assert "recorded cryptographic sign-offs" in del_res.json()["detail"]
    finally:
        if signoff:
            db.delete(signoff)
        db.delete(signed_user)
        db.commit()
        db.close()

def test_admin_delete_user_not_found():
    import uuid
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@superspec.com", "password": "admin"},
    )
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    random_id = uuid.uuid4()
    del_res = client.delete(f"/api/auth/users/{random_id}", headers=headers)
    assert del_res.status_code == 404

def test_non_admin_cannot_delete_user():
    import uuid
    login_response = client.post(
        "/api/auth/login",
        data={"username": "viewer@superspec.com", "password": "password"},
    )
    viewer_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {viewer_token}"}

    random_id = uuid.uuid4()
    del_res = client.delete(f"/api/auth/users/{random_id}", headers=headers)
    assert del_res.status_code == 403

def test_admin_delete_user_unauthorized():
    import uuid
    random_id = uuid.uuid4()
    del_res = client.delete(f"/api/auth/users/{random_id}")
    assert del_res.status_code == 401

