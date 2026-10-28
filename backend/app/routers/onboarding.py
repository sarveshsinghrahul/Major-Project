from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession
from app.models import LearnerProfile, Quiz, QuizKind, Subject, User
from app.schemas.onboarding import (
    DiagnosticResult,
    ProfileIn,
    ProfileOut,
    QuestionFeedback,
    QuestionOut,
    QuizOut,
    StartDiagnosticIn,
    SubmitIn,
    TopicMasteryOut,
)
from app.services import learner_model, quiz_engine
from app.services.quiz_engine import QuizError, SubmittedAnswer

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


def _profile(user: User) -> LearnerProfile:
    if user.profile is None:
        user.profile = LearnerProfile()
    return user.profile


def _own_diagnostic(db: DbSession, user: User, quiz_id: int) -> Quiz:
    quiz = db.get(Quiz, quiz_id)
    if quiz is None or quiz.user_id != user.id or quiz.kind != QuizKind.diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic not found")
    return quiz


def _result(db: DbSession, user: User, quiz: Quiz) -> DiagnosticResult:
    profile = _profile(user)
    subject = db.get(Subject, quiz.subject_id)
    states = learner_model.mastery_states(db, user, subject.topics)
    questions = {q.id: q for q in quiz_engine.quiz_questions(db, quiz)}
    feedback = [
        QuestionFeedback(
            question_id=r.question_id,
            topic_id=questions[r.question_id].topic_id,
            text=questions[r.question_id].text,
            options=questions[r.question_id].options,
            chosen=r.chosen,
            correct_answer=questions[r.question_id].answer,
            is_correct=r.is_correct,
            explanation=questions[r.question_id].explanation,
        )
        for r in sorted(quiz.responses, key=lambda r: quiz.question_ids.index(r.question_id))
        if r.question_id in questions
    ]
    return DiagnosticResult(
        quiz_id=quiz.id,
        score=quiz.score or 0.0,
        overall=profile.level_score or 0.0,
        level=profile.level,
        level_reason=profile.level_reason or "",
        correct=sum(f.is_correct for f in feedback),
        total=len(feedback),
        topics=[
            TopicMasteryOut(topic_id=t.id, name=t.name, mastery=s.mastery, status=s.status, reason=s.reason)
            for t in subject.topics
            for s in [states[t.id]]
        ],
        feedback=feedback,
    )


@router.get("/profile", response_model=ProfileOut)
def get_profile(user: CurrentUser, db: DbSession) -> LearnerProfile:
    profile = _profile(user)
    db.commit()
    return profile


@router.put("/profile", response_model=ProfileOut)
def save_profile(data: ProfileIn, user: CurrentUser, db: DbSession) -> LearnerProfile:
    profile = _profile(user)
    for field, value in data.model_dump().items():
        setattr(profile, field, value)
    profile.onboarding_step = max(profile.onboarding_step, 1)
    db.commit()
    return profile


@router.post("/diagnostic", response_model=QuizOut)
def start_diagnostic(data: StartDiagnosticIn, user: CurrentUser, db: DbSession) -> QuizOut:
    if _profile(user).onboarding_step < 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Save your learning profile first")
    subject = db.get(Subject, data.subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    try:
        quiz = quiz_engine.create_diagnostic(db, user, subject)
    except QuizError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return QuizOut(
        id=quiz.id,
        subject_id=quiz.subject_id,
        kind=quiz.kind.value,
        questions=[QuestionOut.model_validate(q) for q in quiz_engine.quiz_questions(db, quiz)],
    )


@router.post("/diagnostic/{quiz_id}/submit", response_model=DiagnosticResult)
def submit_diagnostic(quiz_id: int, data: SubmitIn, user: CurrentUser, db: DbSession) -> DiagnosticResult:
    quiz = _own_diagnostic(db, user, quiz_id)
    if quiz.submitted_at is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Diagnostic already submitted")
    answers = [SubmittedAnswer(a.question_id, a.chosen, a.time_taken_sec) for a in data.answers]
    try:
        graded = quiz_engine.grade(db, quiz, answers)
    except QuizError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    subject = db.get(Subject, quiz.subject_id)
    learner_model.apply_diagnostic(
        db,
        user,
        subject.topics,
        [learner_model.GradedAnswer(q.topic_id, q.difficulty, r.is_correct) for q, r in graded],
    )
    db.commit()
    return _result(db, user, quiz)


@router.get("/diagnostic/latest", response_model=DiagnosticResult)
def latest_diagnostic(user: CurrentUser, db: DbSession) -> DiagnosticResult:
    quiz = db.scalar(
        select(Quiz)
        .where(Quiz.user_id == user.id, Quiz.kind == QuizKind.diagnostic, Quiz.submitted_at.is_not(None))
        .order_by(Quiz.submitted_at.desc(), Quiz.id.desc())
    )
    if quiz is None:
        raise HTTPException(status_code=404, detail="No diagnostic submitted yet")
    return _result(db, user, quiz)
