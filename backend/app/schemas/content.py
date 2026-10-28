from pydantic import BaseModel, ConfigDict

from app.models import Level, ResourceType


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str
    difficulty: int
    est_minutes: int
    prerequisite_ids: list[int]


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: ResourceType
    title: str
    url: str | None
    body: str | None
    level: Level
    est_minutes: int
