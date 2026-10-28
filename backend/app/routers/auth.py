import jwt
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession
from app.models import LearnerProfile, Role, User
from app.schemas.auth import LoginIn, RefreshIn, RegisterIn, TokenPair, UserOut
from app.security import create_token, decode_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens(user: User) -> TokenPair:
    return TokenPair(access_token=create_token(user.id, "access"), refresh_token=create_token(user.id, "refresh"))


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        level=user.profile.level if user.profile else None,
    )


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: DbSession) -> TokenPair:
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    # Self-registration always creates students; instructors are created by an admin.
    user = User(name=data.name, email=email, password_hash=hash_password(data.password), role=Role.student)
    user.profile = LearnerProfile(consent_analytics=data.consent_analytics)
    db.add(user)
    db.commit()
    return _tokens(user)


@router.post("/login", response_model=TokenPair)
def login(data: LoginIn, db: DbSession) -> TokenPair:
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return _tokens(user)


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshIn, db: DbSession) -> TokenPair:
    try:
        user_id = decode_token(data.refresh_token, "refresh")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return _tokens(user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> UserOut:
    return _user_out(user)
