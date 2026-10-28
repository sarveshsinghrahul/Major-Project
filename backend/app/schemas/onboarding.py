from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import Level, TopicStatus

Format = Literal["notes", "video", "link", "practice"]


class ProfileIn(BaseModel):
    goal: str | None = Field(default=None, max_length=255)
    weekly_hours_available: float = Field(ge=1, le=40)
    preferred_days: list[int] = Field(min_length=1, max_length=7, description="0 = Monday ... 6 = Sunday")
    preferred_formats: list[Format] = Field(default_factory=list)
    self_rated_familiarity: float = Field(ge=0, le=1)

    @field_validator("preferred_days")
    @classmethod
    def _valid_days(cls, days: list[int]) -> list[int]:
        if any(not 0 <= d <= 6 for d in days):
            raise ValueError("days must be between 0 (Monday) and 6 (Sunday)")
        return sorted(set(days))

    @field_validator("preferred_formats")
    @classmethod
    def _unique_formats(cls, formats: list[str]) -> list[str]:
        return sorted(set(formats))


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    goal: str | None
    weekly_hours_available: float
    preferred_days: list[int]
    preferred_formats: list[str]
    self_rated_familiarity: float
    level: Level | None
    level_score: float | None
    level_reason: str | None
    onboarding_step: int


class StartDiagnosticIn(BaseModel):
    subject_id: int


class QuestionOut(BaseModel):
    """A question as served to the learner: no answer, no explanation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    text: str
    options: list[str]


class QuizOut(BaseModel):
    id: int
    subject_id: int
    kind: str
    questions: list[QuestionOut]


class AnswerIn(BaseModel):
    question_id: int
    chosen: int | None = None
    time_taken_sec: float | None = Field(default=None, ge=0, le=3600)


class SubmitIn(BaseModel):
    answers: list[AnswerIn]


class QuestionFeedback(BaseModel):
    question_id: int
    topic_id: int
    text: str
    options: list[str]
    chosen: int | None
    correct_answer: int
    is_correct: bool
    explanation: str


class TopicMasteryOut(BaseModel):
    topic_id: int
    name: str
    mastery: float
    status: TopicStatus
    reason: str


class DiagnosticResult(BaseModel):
    quiz_id: int
    score: float
    overall: float
    level: Level
    level_reason: str
    correct: int
    total: int
    topics: list[TopicMasteryOut]
    feedback: list[QuestionFeedback]
