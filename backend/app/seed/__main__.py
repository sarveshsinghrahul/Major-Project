"""Seed the database: `python -m app.seed` (run `alembic upgrade head` first)."""

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import Question, Topic
from app.seed.loader import load_all


def main() -> None:
    with SessionLocal() as db:
        for subject in load_all(db):
            topics = db.scalar(select(func.count()).select_from(Topic).where(Topic.subject_id == subject.id))
            questions = db.scalar(
                select(func.count()).select_from(Question).join(Topic).where(Topic.subject_id == subject.id)
            )
            print(f"Seeded {subject.name}: {topics} topics, {questions} questions")


if __name__ == "__main__":
    main()
