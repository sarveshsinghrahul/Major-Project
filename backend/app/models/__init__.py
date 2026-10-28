"""Import every model here so Alembic autogenerate and Base.metadata see all tables."""

from app.models.content import Question, QuestionType, Resource, ResourceType, Subject, Topic, topic_prerequisites
from app.models.user import LearnerProfile, Level, Role, User

__all__ = [
    "LearnerProfile",
    "Level",
    "Question",
    "QuestionType",
    "Resource",
    "ResourceType",
    "Role",
    "Subject",
    "Topic",
    "User",
    "topic_prerequisites",
]
