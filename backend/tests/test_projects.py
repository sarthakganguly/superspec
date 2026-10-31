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

def get_default_project_payload(name="Test Project", description="A project for testing"):
    return {
        "name": name,
        "description": description,
        "business_requirement_owner": "product@superspec.com",
        "data_dictionary_owner": "data@superspec.com",
        "user_story_owner": "qa@superspec.com",
        "requirement_sign_off_owner": "admin@superspec.com",
    }

def test_create_project():
    headers = get_auth_headers()
    response = client.post(
        "/api/projects",
        headers=headers,
        json=get_default_project_payload()
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Project"
    assert "id" in response.json()
    proj_id = response.json()["id"]

    # Verify members
    members_res = client.get(f"/api/projects/{proj_id}/members", headers=headers)
    assert members_res.status_code == 200
    roles = {m["role"] for m in members_res.json()}
    assert "PROJECT_ADMIN" in roles
    assert "BUSINESS_REQUIREMENT_OWNER" in roles
    assert "DATA_DICTIONARY_OWNER" in roles
    assert "USER_STORY_OWNER" in roles
    assert "REQUIREMENT_SIGN_OFF_OWNER" in roles

def test_create_project_missing_owners():
    headers = get_auth_headers()
    # Missing required owners
    res = client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Incomplete Project", "description": "No owners"}
    )
    assert res.status_code == 422

def test_create_project_nonexistent_owner():
    headers = get_auth_headers()
    payload = get_default_project_payload("Ghost Owner Project")
    payload["business_requirement_owner"] = "nonexistent_ghost_user@superspec.com"
    res = client.post(
        "/api/projects",
        headers=headers,
        json=payload
    )
    assert res.status_code == 404
    assert "not found" in res.json()["detail"]

def test_get_projects():
    headers = get_auth_headers()
    response = client.get("/api/projects", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert any(p["name"] == "Test Project" for p in response.json())

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

def test_delete_project_success():
    headers = get_auth_headers()
    create_res = client.post(
        "/api/projects",
        headers=headers,
        json=get_default_project_payload("Project to Delete", "Temp")
    )
    assert create_res.status_code == 201
    proj_id = create_res.json()["id"]

    del_res = client.delete(f"/api/projects/{proj_id}", headers=headers)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/projects/{proj_id}", headers=headers)
    assert get_res.status_code == 404

def test_delete_project_forbidden():
    reviewer_login = client.post(
        "/api/auth/login",
        data={"username": "viewer@superspec.com", "password": "password"},
    )
    assert reviewer_login.status_code == 200
    reviewer_headers = {"Authorization": f"Bearer {reviewer_login.json()['access_token']}"}

    admin_headers = get_auth_headers()
    create_res = client.post(
        "/api/projects",
        headers=admin_headers,
        json=get_default_project_payload("Project Protected", "Protected")
    )
    proj_id = create_res.json()["id"]

    client.post(
        f"/api/projects/{proj_id}/members",
        headers=admin_headers,
        json={"email": "viewer@superspec.com", "role": "REVIEWER"}
    )

    del_res = client.delete(f"/api/projects/{proj_id}", headers=reviewer_headers)
    assert del_res.status_code == 403

    client.delete(f"/api/projects/{proj_id}", headers=admin_headers)

def test_bulk_delete_projects_success():
    headers = get_auth_headers()
    p1 = client.post(
        "/api/projects",
        headers=headers,
        json=get_default_project_payload("Bulk 1", "To be deleted")
    ).json()
    p2 = client.post(
        "/api/projects",
        headers=headers,
        json=get_default_project_payload("Bulk 2", "To be deleted")
    ).json()

    del_res = client.post(
        "/api/projects/bulk-delete",
        headers=headers,
        json={"project_ids": [p1["id"], p2["id"]]}
    )
    assert del_res.status_code == 200
    data = del_res.json()
    assert data["deleted_count"] == 2
    assert p1["id"] in data["deleted_ids"]
    assert p2["id"] in data["deleted_ids"]

    assert client.get(f"/api/projects/{p1['id']}", headers=headers).status_code == 404
    assert client.get(f"/api/projects/{p2['id']}", headers=headers).status_code == 404

def test_bulk_delete_projects_empty():
    headers = get_auth_headers()
    del_res = client.post(
        "/api/projects/bulk-delete",
        headers=headers,
        json={"project_ids": []}
    )
    assert del_res.status_code == 200
    assert del_res.json()["deleted_count"] == 0
    assert del_res.json()["deleted_ids"] == []

def test_bulk_delete_projects_forbidden():
    admin_headers = get_auth_headers()
    p1 = client.post(
        "/api/projects",
        headers=admin_headers,
        json=get_default_project_payload("Bulk Forbidden 1", "Restricted")
    ).json()

    reviewer_login = client.post(
        "/api/auth/login",
        data={"username": "viewer@superspec.com", "password": "password"},
    )
    assert reviewer_login.status_code == 200
    reviewer_headers = {"Authorization": f"Bearer {reviewer_login.json()['access_token']}"}

    # Viewer tries to bulk delete p1
    res = client.post(
        "/api/projects/bulk-delete",
        headers=reviewer_headers,
        json={"project_ids": [p1["id"]]}
    )
    assert res.status_code == 403

    # Clean up
    client.delete(f"/api/projects/{p1['id']}", headers=admin_headers)

