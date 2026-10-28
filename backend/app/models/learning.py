import enum
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.user import utcnow


class QuizKind(str, enum.Enum):
    diagnostic = "diagnostic"
    practice = "practice"
    topic_test = "topic_test"
    revision = "revision"


class TopicStatus(str, enum.Enum):
    locked = "locked"
    available = "available"
    in_progress = "in_progress"
    mastered = "mastered"


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    kind: Mapped[QuizKind] = mapped_column(Enum(QuizKind))
    topic_id: Mapped[int | None] = mapped_column(ForeignKey("topics.id", ondelete="SET NULL"))
    # Question ids in the order they were served; fixed when the quiz is created.
    question_ids: Mapped[list[int]] = mapped_column(JSON)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score: Mapped[float | None] = mapped_column(Float)  # 0..1, difficulty-weighted

    responses: Mapped[list["QuizResponse"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    chosen: Mapped[int | None] = mapped_column(Integer)  # None = skipped
    is_correct: Mapped[bool] = mapped_column(Boolean)
    time_taken_sec: Mapped[float | None] = mapped_column(Float)

    quiz: Mapped[Quiz] = relationship(back_populates="responses")


class TopicMastery(Base):
    __tablename__ = "topic_mastery"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True)
    mastery: Mapped[float] = mapped_column(Float, default=0.0)  # 0..1
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[TopicStatus] = mapped_column(Enum(TopicStatus), default=TopicStatus.locked)
    reason: Mapped[str] = mapped_column(Text, default="")  # human-readable "why" for the dashboard
    last_practiced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class LearningEvent(Base):
    """Append-only activity log; the raw input for analytics and the ML layer."""

    __tablename__ = "learning_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(40))  # e.g. quiz_submit, resource_complete
    ref_id: Mapped[int | None] = mapped_column(Integer)
    duration_sec: Mapped[float | None] = mapped_column(Float)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
