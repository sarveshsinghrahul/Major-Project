from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registers tables on Base.metadata)
from app.db import Base, get_db
from app.main import app
from app.seed.loader import load_all


@pytest.fixture
def db() -> Iterator[Session]:
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seeded(db: Session) -> Session:
    load_all(db)
    return db


def register(client: TestClient, email: str = "asha@example.com", password: str = "s3cret-pass") -> dict:
    resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Asha", "email": email, "password": password, "consent_analytics": True},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    return {"Authorization": f"Bearer {register(client)['access_token']}"}
