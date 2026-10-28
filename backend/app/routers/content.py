from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.deps import CurrentUser, DbSession
from app.models import Subject, Topic
from app.schemas.content import ResourceOut, SubjectOut, TopicOut
from app.schemas.onboarding import TopicMasteryOut
from app.services import learner_model
from app.services.graph import topological_order

router = APIRouter(tags=["content"])


def _topic_out(topic: Topic) -> TopicOut:
    return TopicOut(
        id=topic.id,
        slug=topic.slug,
        name=topic.name,
        description=topic.description,
        difficulty=topic.difficulty,
        est_minutes=topic.est_minutes,
        prerequisite_ids=sorted(p.id for p in topic.prerequisites),
    )


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(db: DbSession, _: CurrentUser) -> list[Subject]:
    return list(db.scalars(select(Subject).order_by(Subject.name)))


@router.get("/subjects/{subject_id}/topics", response_model=list[TopicOut])
def list_topics(subject_id: int, db: DbSession, _: CurrentUser) -> list[TopicOut]:
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    topics = [_topic_out(t) for t in subject.topics]
    # Return topics in prerequisite order so clients can render them as a roadmap.
    order = topological_order({t.id: t.prerequisite_ids for t in topics})
    by_id = {t.id: t for t in topics}
    return [by_id[i] for i in order]


@router.get("/topics/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: int, db: DbSession, _: CurrentUser) -> TopicOut:
    topic = db.get(Topic, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return _topic_out(topic)


@router.get("/topics/{topic_id}/resources", response_model=list[ResourceOut])
def list_resources(topic_id: int, db: DbSession, _: CurrentUser):
    topic = db.get(Topic, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic.resources


@router.get("/subjects/{subject_id}/mastery", response_model=list[TopicMasteryOut])
def subject_mastery(subject_id: int, db: DbSession, user: CurrentUser) -> list[TopicMasteryOut]:
    """The current user's mastery and status for every topic, in prerequisite order."""
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    states = learner_model.mastery_states(db, user, subject.topics)
    by_id = {t.id: t for t in subject.topics}
    order = topological_order({t.id: [p.id for p in t.prerequisites] for t in subject.topics})
    return [
        TopicMasteryOut(topic_id=i, name=by_id[i].name, mastery=states[i].mastery, status=states[i].status, reason=states[i].reason)
        for i in order
    ]
