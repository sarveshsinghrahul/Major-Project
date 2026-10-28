"""Learner model: turns quiz evidence into topic mastery, topic status and level.

The scoring functions are pure so they can be unit-tested and explained in the
report; `apply_diagnostic` is the only part that touches the database.
"""

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.models import Level, Topic, TopicMastery, TopicStatus, User


@dataclass(frozen=True)
class GradedAnswer:
    topic_id: int
    difficulty: int
    is_correct: bool


@dataclass(frozen=True)
class TopicState:
    mastery: float
    status: TopicStatus
    reason: str


def weighted_accuracy(answers: Iterable[GradedAnswer]) -> float | None:
    """Share of difficulty points earned: a correct hard question counts more than an easy one."""
    total = earned = 0
    for a in answers:
        total += a.difficulty
        earned += a.difficulty if a.is_correct else 0
    return earned / total if total else None


def overall_score(diagnostic_accuracy: float, self_familiarity: float, settings: Settings | None = None) -> float:
    s = settings or get_settings()
    return s.diagnostic_weight * diagnostic_accuracy + (1 - s.diagnostic_weight) * self_familiarity


def classify_level(overall: float, settings: Settings | None = None) -> Level:
    s = settings or get_settings()
    if overall < s.level_intermediate_min:
        return Level.beginner
    if overall > s.level_advanced_min:
        return Level.advanced
    return Level.intermediate


def level_reason(level: Level, overall: float, accuracy: float, familiarity: float, settings: Settings | None = None) -> str:
    s = settings or get_settings()
    bands = {
        Level.beginner: f"below {s.level_intermediate_min:.0%}",
        Level.intermediate: f"between {s.level_intermediate_min:.0%} and {s.level_advanced_min:.0%}",
        Level.advanced: f"above {s.level_advanced_min:.0%}",
    }
    return (
        f"Overall score {overall:.0%}: {s.diagnostic_weight:.0%} from your diagnostic ({accuracy:.0%}, "
        f"weighted by question difficulty) and {1 - s.diagnostic_weight:.0%} from your self-rating "
        f"({familiarity:.0%}). Scores {bands[level]} are {level.value}."
    )


def topic_states(
    mastery: Mapping[int, float],
    prerequisites: Mapping[int, Sequence[int]],
    names: Mapping[int, str],
    settings: Settings | None = None,
) -> dict[int, TopicState]:
    """Derive each topic's status (mastered / available / locked) and the reason for it."""
    s = settings or get_settings()
    states: dict[int, TopicState] = {}
    for topic_id, prereqs in prerequisites.items():
        m = mastery.get(topic_id, 0.0)
        weak = [p for p in prereqs if mastery.get(p, 0.0) < s.prerequisite_ready_min]
        if m >= s.mastered_min:
            status, reason = TopicStatus.mastered, f"You scored {m:.0%} on this topic's questions."
        elif weak:
            gaps = ", ".join(f"{names[p]} ({mastery.get(p, 0.0):.0%})" for p in weak)
            status = TopicStatus.locked
            reason = f"Unlocks when these reach {s.prerequisite_ready_min:.0%}: {gaps}."
        elif prereqs:
            status = TopicStatus.available
            reason = "Prerequisites are ready: " + ", ".join(names[p] for p in prereqs) + "."
        else:
            status, reason = TopicStatus.available, "No prerequisites, so this is a good place to start."
        states[topic_id] = TopicState(mastery=m, status=status, reason=reason)
    return states


def subject_graph(topics: Sequence[Topic]) -> tuple[dict[int, list[int]], dict[int, str]]:
    return {t.id: [p.id for p in t.prerequisites] for t in topics}, {t.id: t.name for t in topics}


def apply_diagnostic(db: Session, user: User, topics: Sequence[Topic], answers: Sequence[GradedAnswer]) -> Level:
    """Set initial mastery for every topic of the subject and classify the learner's level.

    Topics without diagnostic questions start at 0 mastery. The level, its score and the
    reason are stored on the learner profile. Does not commit.
    """
    profile = user.profile
    familiarity = profile.self_rated_familiarity if profile else 0.0
    accuracy = weighted_accuracy(answers) or 0.0
    overall = overall_score(accuracy, familiarity)
    level = classify_level(overall)

    by_topic: dict[int, list[GradedAnswer]] = {}
    for a in answers:
        by_topic.setdefault(a.topic_id, []).append(a)
    mastery = {t.id: weighted_accuracy(by_topic.get(t.id, [])) or 0.0 for t in topics}
    prereqs, names = subject_graph(topics)
    states = topic_states(mastery, prereqs, names)

    existing = {
        row.topic_id: row
        for row in db.scalars(
            select(TopicMastery).where(TopicMastery.user_id == user.id, TopicMastery.topic_id.in_(mastery))
        )
    }
    now = datetime.now(timezone.utc)
    for topic_id, state in states.items():
        row = existing.get(topic_id)
        if row is None:
            row = TopicMastery(user_id=user.id, topic_id=topic_id, attempts=0)
            db.add(row)
        row.mastery = state.mastery
        row.status = state.status
        row.reason = state.reason
        if topic_id in by_topic:
            row.attempts += 1
            row.last_practiced_at = now

    if profile is not None:
        profile.level = level
        profile.level_score = overall
        profile.level_reason = level_reason(level, overall, accuracy, familiarity)
        profile.onboarding_step = max(profile.onboarding_step, 2)
    return level


def mastery_states(db: Session, user: User, topics: Sequence[Topic]) -> dict[int, TopicState]:
    """Stored mastery for the user's topics; topics never assessed get computed zero-mastery states."""
    rows = {
        row.topic_id: row
        for row in db.scalars(
            select(TopicMastery).where(TopicMastery.user_id == user.id, TopicMastery.topic_id.in_([t.id for t in topics]))
        )
    }
    prereqs, names = subject_graph(topics)
    computed = topic_states({tid: row.mastery for tid, row in rows.items()}, prereqs, names)
    return {
        t.id: TopicState(rows[t.id].mastery, rows[t.id].status, rows[t.id].reason) if t.id in rows else computed[t.id]
        for t in topics
    }
