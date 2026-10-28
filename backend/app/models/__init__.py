"""Import every model here so Alembic autogenerate and Base.metadata see all tables."""

from app.models.content import Question, QuestionType, Resource, ResourceType, Subject, Topic, topic_prerequisites
from app.models.learning import LearningEvent, Quiz, QuizKind, QuizResponse, TopicMastery, TopicStatus
from app.models.user import LearnerProfile, Level, Role, User

__all__ = [
    "LearnerProfile",
    "LearningEvent",
    "Level",
    "Question",
    "QuestionType",
    "Quiz",
    "QuizKind",
    "QuizResponse",
    "Resource",
    "ResourceType",
    "Role",
    "Subject",
    "Topic",
    "TopicMastery",
    "TopicStatus",
    "User",
    "topic_prerequisites",
]
