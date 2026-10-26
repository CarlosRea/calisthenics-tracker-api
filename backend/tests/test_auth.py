def test_login_demo_user(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "calisthenics123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_auth_me_with_bearer_token(client):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "calisthenics123"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "admin"


def test_auth_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_register_new_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "street_athlete", "password": "secretpassword123"},
    )
    assert response.status_code == 201
    assert response.json()["username"] == "street_athlete"

    # Login with new credentials
    login_res = client.post(
        "/api/auth/login",
        json={"username": "street_athlete", "password": "secretpassword123"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_register_duplicate_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "admin", "password": "password123"},
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
