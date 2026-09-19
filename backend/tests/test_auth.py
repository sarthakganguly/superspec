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
