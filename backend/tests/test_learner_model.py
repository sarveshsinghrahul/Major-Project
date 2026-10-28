import pytest

from app.config import Settings
from app.models import Level, TopicStatus
from app.services.learner_model import (
    GradedAnswer,
    classify_level,
    overall_score,
    topic_states,
    weighted_accuracy,
)

S = Settings()


def test_weighted_accuracy_counts_hard_questions_more():
    easy_right_hard_wrong = [GradedAnswer(1, 1, True), GradedAnswer(1, 3, False)]
    easy_wrong_hard_right = [GradedAnswer(1, 1, False), GradedAnswer(1, 3, True)]
    assert weighted_accuracy(easy_right_hard_wrong) == pytest.approx(0.25)
    assert weighted_accuracy(easy_wrong_hard_right) == pytest.approx(0.75)
    assert weighted_accuracy([]) is None


def test_overall_score_blends_self_rating():
    assert overall_score(1.0, 0.0, S) == pytest.approx(0.8)
    assert overall_score(0.5, 1.0, S) == pytest.approx(0.6)


@pytest.mark.parametrize(
    ("overall", "level"),
    [
        (0.0, Level.beginner),
        (0.39, Level.beginner),
        (0.4, Level.intermediate),
        (0.75, Level.intermediate),
        (0.76, Level.advanced),
        (1.0, Level.advanced),
    ],
)
def test_level_thresholds(overall, level):
    assert classify_level(overall, S) == level


def test_topic_states():
    # 1 -> 2 -> 3, and 4 depends on 1 and 3
    prereqs = {1: [], 2: [1], 3: [2], 4: [1, 3]}
    names = {1: "Arrays", 2: "Recursion", 3: "Sorting", 4: "DP"}
    mastery = {1: 0.9, 2: 0.65, 3: 0.2}

    states = topic_states(mastery, prereqs, names, S)

    assert states[1].status == TopicStatus.mastered
    assert states[2].status == TopicStatus.available  # Arrays 90% >= 60%
    assert "Arrays" in states[2].reason
    assert states[3].status == TopicStatus.available  # Recursion 65% >= 60%
    assert states[4].status == TopicStatus.locked
    assert "Sorting (20%)" in states[4].reason and "Arrays" not in states[4].reason
    assert states[4].mastery == 0.0


def test_topic_without_prerequisites_is_available():
    states = topic_states({}, {1: []}, {1: "Big-O"}, S)
    assert states[1].status == TopicStatus.available
