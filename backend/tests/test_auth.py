from app.models import Role, User
from app.security import create_token
from tests.conftest import register


def test_register_then_me(client):
    tokens = register(client)
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "asha@example.com"
    assert body["role"] == "student"
    assert body["level"] is None


def test_register_stores_hash_and_consent(client, db):
    register(client)
    user = db.query(User).one()
    assert user.password_hash != "s3cret-pass"
    assert user.profile.consent_analytics is True
    assert user.role == Role.student


def test_duplicate_email_is_case_insensitive(client):
    register(client, email="asha@example.com")
    resp = client.post(
        "/api/v1/auth/register",
        json={"name": "A", "email": "ASHA@example.com", "password": "another-pass", "consent_analytics": False},
    )
    assert resp.status_code == 409


def test_short_password_rejected(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"name": "A", "email": "a@example.com", "password": "short", "consent_analytics": True},
    )
    assert resp.status_code == 422


def test_login(client):
    register(client)
    ok = client.post("/api/v1/auth/login", json={"email": "asha@example.com", "password": "s3cret-pass"})
    assert ok.status_code == 200
    assert ok.json()["access_token"]

    bad = client.post("/api/v1/auth/login", json={"email": "asha@example.com", "password": "wrong-pass"})
    assert bad.status_code == 401
    unknown = client.post("/api/v1/auth/login", json={"email": "nobody@example.com", "password": "s3cret-pass"})
    assert unknown.status_code == 401


def test_refresh(client):
    tokens = register(client)
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200
    # An access token must not be accepted as a refresh token.
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["access_token"]})
    assert resp.status_code == 401


def test_me_requires_valid_access_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401
    tokens = register(client)
    refresh_as_access = {"Authorization": f"Bearer {tokens['refresh_token']}"}
    assert client.get("/api/v1/auth/me", headers=refresh_as_access).status_code == 401
    deleted_user = {"Authorization": f"Bearer {create_token(9999, 'access')}"}
    assert client.get("/api/v1/auth/me", headers=deleted_user).status_code == 401
