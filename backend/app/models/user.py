import enum
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(str, enum.Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class Level(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.student)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    profile: Mapped["LearnerProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    goal: Mapped[str | None] = mapped_column(String(255))
    weekly_hours_available: Mapped[float] = mapped_column(Float, default=5.0)
    preferred_days: Mapped[list[int]] = mapped_column(JSON, default=lambda: [0, 1, 2, 3, 4])
    preferred_formats: Mapped[list[str]] = mapped_column(JSON, default=list)
    # 0..1, from the onboarding questionnaire; blended with the diagnostic score.
    self_rated_familiarity: Mapped[float] = mapped_column(Float, default=0.0)
    consent_analytics: Mapped[bool] = mapped_column(Boolean, default=False)
    level: Mapped[Level | None] = mapped_column(Enum(Level))
    level_score: Mapped[float | None] = mapped_column(Float)  # 0..1 overall score behind `level`
    level_reason: Mapped[str | None] = mapped_column(Text)
    pace_factor: Mapped[float] = mapped_column(Float, default=1.0)
    # 0 = new, 1 = profile saved, 2 = diagnostic done
    onboarding_step: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped[User] = relationship(back_populates="profile")
