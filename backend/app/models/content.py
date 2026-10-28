import enum

from sqlalchemy import JSON, Boolean, Column, Enum, ForeignKey, Integer, String, Table, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.user import Level

topic_prerequisites = Table(
    "topic_prerequisites",
    Base.metadata,
    Column("topic_id", ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True),
    Column("prereq_topic_id", ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True),
)


class ResourceType(str, enum.Enum):
    notes = "notes"
    video = "video"
    link = "link"
    practice = "practice"


class QuestionType(str, enum.Enum):
    mcq = "mcq"
    true_false = "true_false"


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")

    topics: Mapped[list["Topic"]] = relationship(back_populates="subject", order_by="Topic.order_hint")


class Topic(Base):
    __tablename__ = "topics"
    __table_args__ = (UniqueConstraint("subject_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True)
    slug: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[int] = mapped_column(Integer, default=1)  # 1..5
    est_minutes: Mapped[int] = mapped_column(Integer, default=60)
    order_hint: Mapped[int] = mapped_column(Integer, default=0)

    subject: Mapped[Subject] = relationship(back_populates="topics")
    prerequisites: Mapped[list["Topic"]] = relationship(
        secondary=topic_prerequisites,
        primaryjoin=lambda: Topic.id == topic_prerequisites.c.topic_id,
        secondaryjoin=lambda: Topic.id == topic_prerequisites.c.prereq_topic_id,
    )
    resources: Mapped[list["Resource"]] = relationship(back_populates="topic", cascade="all, delete-orphan")
    questions: Mapped[list["Question"]] = relationship(back_populates="topic", cascade="all, delete-orphan")


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    type: Mapped[ResourceType] = mapped_column(Enum(ResourceType))
    title: Mapped[str] = mapped_column(String(255))
    url: Mapped[str | None] = mapped_column(String(500))
    body: Mapped[str | None] = mapped_column(Text)
    level: Mapped[Level] = mapped_column(Enum(Level), default=Level.beginner)
    est_minutes: Mapped[int] = mapped_column(Integer, default=15)

    topic: Mapped[Topic] = relationship(back_populates="resources")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), default=QuestionType.mcq)
    text: Mapped[str] = mapped_column(Text)
    options: Mapped[list[str]] = mapped_column(JSON)
    answer: Mapped[int] = mapped_column(Integer)  # index into options; never sent to clients before grading
    explanation: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[int] = mapped_column(Integer, default=1)  # 1..5
    is_diagnostic: Mapped[bool] = mapped_column(Boolean, default=False)

    topic: Mapped[Topic] = relationship(back_populates="questions")
