"""Quiz creation and server-side grading. Answers never leave the server before submission."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import LearningEvent, Question, Quiz, QuizKind, QuizResponse, Subject, User
from app.services.graph import topological_order


class QuizError(ValueError):
    pass


@dataclass(frozen=True)
class SubmittedAnswer:
    question_id: int
    chosen: int | None
    time_taken_sec: float | None


def create_diagnostic(db: Session, user: User, subject: Subject) -> Quiz:
    """Start a diagnostic for the subject, or resume the user's unsubmitted one. Commits."""
    open_quiz = db.scalar(
        select(Quiz).where(
            Quiz.user_id == user.id,
            Quiz.subject_id == subject.id,
            Quiz.kind == QuizKind.diagnostic,
            Quiz.submitted_at.is_(None),
        )
    )
    if open_quiz is not None:
        return open_quiz

    # Foundations first, and easier questions first within a topic.
    topic_order = topological_order({t.id: [p.id for p in t.prerequisites] for t in subject.topics})
    rank = {topic_id: i for i, topic_id in enumerate(topic_order)}
    questions = [q for t in subject.topics for q in t.questions if q.is_diagnostic]
    if not questions:
        raise QuizError("This subject has no diagnostic questions yet")
    questions.sort(key=lambda q: (rank[q.topic_id], q.difficulty, q.id))

    quiz = Quiz(user_id=user.id, subject_id=subject.id, kind=QuizKind.diagnostic, question_ids=[q.id for q in questions])
    db.add(quiz)
    db.commit()
    return quiz


def quiz_questions(db: Session, quiz: Quiz) -> list[Question]:
    by_id = {q.id: q for q in db.scalars(select(Question).where(Question.id.in_(quiz.question_ids)))}
    return [by_id[i] for i in quiz.question_ids if i in by_id]


def grade(db: Session, quiz: Quiz, answers: Sequence[SubmittedAnswer]) -> list[tuple[Question, QuizResponse]]:
    """Record responses for every question in the quiz (unanswered ones count as wrong).

    Marks the quiz submitted and logs a learning event. Does not commit.
    """
    if quiz.submitted_at is not None:
        raise QuizError("Quiz already submitted")
    questions = quiz_questions(db, quiz)
    by_id = {q.id: q for q in questions}
    submitted: dict[int, SubmittedAnswer] = {}
    # Validate everything before recording anything.
    for a in answers:
        q = by_id.get(a.question_id)
        if q is None:
            raise QuizError(f"Question {a.question_id} is not part of this quiz")
        if a.question_id in submitted:
            raise QuizError(f"Question {a.question_id} answered twice")
        if a.chosen is not None and not 0 <= a.chosen < len(q.options):
            raise QuizError(f"Option {a.chosen} is out of range for question {q.id}")
        submitted[a.question_id] = a

    graded: list[tuple[Question, QuizResponse]] = []
    for q in questions:
        a = submitted.get(q.id)
        chosen = a.chosen if a else None
        response = QuizResponse(
            question_id=q.id,
            chosen=chosen,
            is_correct=chosen == q.answer,
            time_taken_sec=a.time_taken_sec if a else None,
        )
        quiz.responses.append(response)
        graded.append((q, response))

    total_weight = sum(q.difficulty for q in questions)
    quiz.score = sum(q.difficulty for q, r in graded if r.is_correct) / total_weight if total_weight else 0.0
    quiz.submitted_at = datetime.now(timezone.utc)
    db.add(
        LearningEvent(
            user_id=quiz.user_id,
            type="quiz_submit",
            ref_id=quiz.id,
            duration_sec=sum(r.time_taken_sec or 0 for _, r in graded),
            data={"kind": quiz.kind.value, "score": quiz.score, "questions": len(graded)},
        )
    )
    return graded
