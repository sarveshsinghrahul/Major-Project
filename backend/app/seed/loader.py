"""Load subject content (topics, prerequisites, resources, questions) from YAML.

Loading is idempotent: subjects and topics are matched by slug, resources by title and
questions by text, and each is updated in place so ids (and the quiz history that points
at question ids) survive a reload. Entries no longer in the file are removed.
"""

import random
from pathlib import Path
from typing import Any

import yaml
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Level, Question, QuestionType, Resource, ResourceType, Subject, Topic
from app.services.graph import topological_order

SEED_DIR = Path(__file__).parent


def shuffled_options(text: str, correct: str, wrong: list[str]) -> tuple[list[str], int]:
    """Mix the correct option among the wrong ones, deterministically per question text."""
    options = [correct, *wrong]
    random.Random(text).shuffle(options)
    return options, options.index(correct)


def validate(data: dict[str, Any]) -> None:
    topics = data["topics"]
    slugs = [t["slug"] for t in topics]
    if len(slugs) != len(set(slugs)):
        raise ValueError("duplicate topic slugs")
    # Raises KeyError for unknown prerequisites and CycleError for cycles.
    topological_order({t["slug"]: t.get("prerequisites", []) for t in topics})
    for t in topics:
        for q in t.get("questions", []):
            if len(q["wrong"]) != 3:
                raise ValueError(f"expected exactly 3 wrong options: {q['text']!r}")
            if q["correct"] in q["wrong"]:
                raise ValueError(f"correct answer repeated among wrong options: {q['text']!r}")


def load_subject(db: Session, data: dict[str, Any]) -> Subject:
    validate(data)
    meta = data["subject"]
    subject = db.scalar(select(Subject).where(Subject.slug == meta["slug"]))
    if subject is None:
        subject = Subject(slug=meta["slug"])
        db.add(subject)
    subject.name = meta["name"]
    subject.description = meta.get("description", "")
    db.flush()

    topics_by_slug: dict[str, Topic] = {}
    for order, t in enumerate(data["topics"]):
        topic = db.scalar(select(Topic).where(Topic.subject_id == subject.id, Topic.slug == t["slug"]))
        if topic is None:
            topic = Topic(subject_id=subject.id, slug=t["slug"])
            db.add(topic)
        topic.name = t["name"]
        topic.description = t.get("description", "")
        topic.difficulty = t.get("difficulty", 1)
        topic.est_minutes = t.get("est_minutes", 60)
        topic.order_hint = order
        # Resources and questions are matched by title and text and updated in place, so their ids
        # stay the same across loads: quizzes and their answers point at question ids.
        existing_resources = {r.title: r for r in topic.resources}
        resources = []
        for r in t.get("resources", []):
            resource = existing_resources.get(r["title"]) or Resource(title=r["title"])
            resource.type = ResourceType(r["type"])
            resource.url = r.get("url")
            resource.body = r.get("body")
            resource.level = Level(r.get("level", "beginner"))
            resource.est_minutes = r.get("est_minutes", 15)
            resources.append(resource)
        topic.resources = resources

        existing_questions = {q.text: q for q in topic.questions}
        questions = []
        for q in t.get("questions", []):
            options, answer = shuffled_options(q["text"], str(q["correct"]), [str(w) for w in q["wrong"]])
            question = existing_questions.get(q["text"]) or Question(text=q["text"])
            question.type = QuestionType(q.get("type", "mcq"))
            question.options = options
            question.answer = answer
            question.explanation = q.get("explanation", "")
            question.difficulty = q.get("difficulty", 1)
            question.is_diagnostic = q.get("diagnostic", False)
            questions.append(question)
        # A question removed from the file is deleted, along with the answers given to it.
        topic.questions = questions
        topics_by_slug[t["slug"]] = topic

    for t in data["topics"]:
        topics_by_slug[t["slug"]].prerequisites = [topics_by_slug[p] for p in t.get("prerequisites", [])]

    db.commit()
    return subject


def load_file(db: Session, path: Path) -> Subject:
    with path.open(encoding="utf-8") as f:
        return load_subject(db, yaml.safe_load(f))


def load_all(db: Session) -> list[Subject]:
    return [load_file(db, p) for p in sorted(SEED_DIR.glob("*.yaml"))]
