import pytest
from sqlalchemy import select

from app.models import LearningEvent, Question, Subject, TopicMastery, TopicStatus
from tests.conftest import register

PROFILE = {
    "goal": "Crack placement interviews",
    "weekly_hours_available": 6,
    "preferred_days": [0, 2, 4, 2],
    "preferred_formats": ["notes", "practice"],
    "self_rated_familiarity": 0.5,
}


@pytest.fixture
def subject_id(seeded) -> int:
    return seeded.scalar(select(Subject.id).where(Subject.slug == "dsa"))


def start(client, headers, subject_id):
    assert client.put("/api/v1/onboarding/profile", json=PROFILE, headers=headers).status_code == 200
    resp = client.post("/api/v1/onboarding/diagnostic", json={"subject_id": subject_id}, headers=headers)
    assert resp.status_code == 200, resp.text
    return resp.json()


def answers_for(db, quiz, correct: bool):
    """Answer every question right (or wrong) using the stored answer key."""
    key = {q.id: q.answer for q in db.scalars(select(Question).where(Question.id.in_([x["id"] for x in quiz["questions"]])))}
    return [
        {"question_id": q["id"], "chosen": key[q["id"]] if correct else (key[q["id"]] + 1) % 4, "time_taken_sec": 12}
        for q in quiz["questions"]
    ]


def test_profile_round_trip(client, auth_headers):
    resp = client.put("/api/v1/onboarding/profile", json=PROFILE, headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["preferred_days"] == [0, 2, 4]  # deduplicated and sorted
    assert body["onboarding_step"] == 1
    assert client.get("/api/v1/onboarding/profile", headers=auth_headers).json() == body


def test_profile_validation(client, auth_headers):
    for bad in ({"preferred_days": [7]}, {"preferred_days": []}, {"weekly_hours_available": 0}, {"self_rated_familiarity": 2}):
        resp = client.put("/api/v1/onboarding/profile", json={**PROFILE, **bad}, headers=auth_headers)
        assert resp.status_code == 422, bad


def test_diagnostic_requires_profile(client, auth_headers, subject_id):
    resp = client.post("/api/v1/onboarding/diagnostic", json={"subject_id": subject_id}, headers=auth_headers)
    assert resp.status_code == 409


def test_diagnostic_hides_answers_and_orders_foundations_first(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    assert len(quiz["questions"]) == 32
    for q in quiz["questions"]:
        assert set(q) == {"id", "topic_id", "text", "options"}
    first_topic = seeded.get(Question, quiz["questions"][0]["id"]).topic
    assert first_topic.slug == "complexity"


def test_unsubmitted_diagnostic_is_resumed(client, auth_headers, subject_id):
    first = start(client, auth_headers, subject_id)
    again = client.post("/api/v1/onboarding/diagnostic", json={"subject_id": subject_id}, headers=auth_headers).json()
    assert again["id"] == first["id"]


def test_all_correct_makes_advanced_and_masters_topics(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    resp = client.post(
        f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit",
        json={"answers": answers_for(seeded, quiz, correct=True)},
        headers=auth_headers,
    )
    assert resp.status_code == 200, resp.text
    result = resp.json()
    assert result["score"] == pytest.approx(1.0)
    assert result["overall"] == pytest.approx(0.9)  # 0.8 * 1.0 + 0.2 * 0.5
    assert result["level"] == "advanced"
    assert "90%" in result["level_reason"]
    assert result["correct"] == result["total"] == 32
    assert all(t["status"] == "mastered" for t in result["topics"])
    assert all(f["is_correct"] and f["explanation"] for f in result["feedback"])

    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["level"] == "advanced"
    assert client.get("/api/v1/onboarding/profile", headers=auth_headers).json()["onboarding_step"] == 2
    event = seeded.scalar(select(LearningEvent))
    assert event.type == "quiz_submit" and event.duration_sec == 12 * 32


def test_all_wrong_makes_beginner_with_locked_topics(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    result = client.post(
        f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit",
        json={"answers": answers_for(seeded, quiz, correct=False)},
        headers=auth_headers,
    ).json()
    assert result["level"] == "beginner"
    statuses = {t["name"]: t["status"] for t in result["topics"]}
    assert statuses["Complexity & Big-O"] == "available"
    assert statuses["Arrays"] == "locked"
    assert statuses["Dynamic Programming"] == "locked"


def test_skipped_questions_count_as_wrong(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    first_only = answers_for(seeded, quiz, correct=True)[:1]
    result = client.post(
        f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit", json={"answers": first_only}, headers=auth_headers
    ).json()
    assert result["correct"] == 1 and result["total"] == 32
    assert sum(f["chosen"] is None for f in result["feedback"]) == 31


def test_submit_rejects_bad_input_without_saving(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    url = f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit"
    qid = quiz["questions"][0]["id"]
    assert client.post(url, json={"answers": [{"question_id": 999999, "chosen": 0}]}, headers=auth_headers).status_code == 400
    assert client.post(url, json={"answers": [{"question_id": qid, "chosen": 9}]}, headers=auth_headers).status_code == 400
    twice = [{"question_id": qid, "chosen": 0}, {"question_id": qid, "chosen": 1}]
    assert client.post(url, json={"answers": twice}, headers=auth_headers).status_code == 400
    # The quiz is still open after the rejected attempts.
    assert client.post(url, json={"answers": answers_for(seeded, quiz, True)}, headers=auth_headers).status_code == 200


def test_cannot_submit_twice_or_someone_elses_quiz(client, auth_headers, subject_id, seeded):
    quiz = start(client, auth_headers, subject_id)
    url = f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit"
    body = {"answers": answers_for(seeded, quiz, True)}
    assert client.post(url, json=body, headers=auth_headers).status_code == 200
    assert client.post(url, json=body, headers=auth_headers).status_code == 409

    other = {"Authorization": f"Bearer {register(client, email='other@example.com')['access_token']}"}
    assert client.post(url, json=body, headers=other).status_code == 404
    assert client.get("/api/v1/onboarding/diagnostic/latest", headers=other).status_code == 404


def test_latest_result_and_mastery_endpoint(client, auth_headers, subject_id, seeded):
    # Before any diagnostic, mastery is computed (all zero) and not stored.
    before = client.get(f"/api/v1/subjects/{subject_id}/mastery", headers=auth_headers).json()
    assert before[0]["name"] == "Complexity & Big-O" and before[0]["status"] == "available"
    assert all(t["mastery"] == 0 for t in before)
    assert seeded.scalar(select(TopicMastery)) is None

    quiz = start(client, auth_headers, subject_id)
    submitted = client.post(
        f"/api/v1/onboarding/diagnostic/{quiz['id']}/submit",
        json={"answers": answers_for(seeded, quiz, True)},
        headers=auth_headers,
    ).json()
    assert client.get("/api/v1/onboarding/diagnostic/latest", headers=auth_headers).json() == submitted

    after = client.get(f"/api/v1/subjects/{subject_id}/mastery", headers=auth_headers).json()
    assert all(t["status"] == TopicStatus.mastered.value for t in after)
    assert len(seeded.scalars(select(TopicMastery)).all()) == 16
