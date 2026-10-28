import copy

import pytest
import yaml
from sqlalchemy import func, select

from app.models import Question, Subject, Topic
from app.seed.loader import SEED_DIR, load_all, load_subject, shuffled_options, validate
from app.services.graph import CycleError, topological_order


def dsa_data() -> dict:
    with (SEED_DIR / "dsa.yaml").open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def test_topological_order_respects_prerequisites():
    graph = {"c": ["a", "b"], "a": [], "b": ["a"]}
    order = topological_order(graph)
    assert order == ["a", "b", "c"]


def test_topological_order_rejects_cycles_and_unknowns():
    with pytest.raises(CycleError):
        topological_order({"a": ["b"], "b": ["a"]})
    with pytest.raises(KeyError):
        topological_order({"a": ["missing"]})


def test_seed_file_is_valid():
    data = dsa_data()
    validate(data)
    for topic in data["topics"]:
        diagnostic = [q for q in topic["questions"] if q.get("diagnostic")]
        assert len(diagnostic) >= 2, topic["slug"]
        assert topic["resources"], topic["slug"]


def test_validate_catches_cycle():
    data = copy.deepcopy(dsa_data())
    data["topics"][0]["prerequisites"] = ["dp"]  # complexity -> dp -> recursion -> arrays -> complexity
    with pytest.raises(CycleError):
        validate(data)


def test_shuffle_is_deterministic_and_tracks_answer():
    a = shuffled_options("q", "right", ["w1", "w2", "w3"])
    assert a == shuffled_options("q", "right", ["w1", "w2", "w3"])
    options, answer = a
    assert options[answer] == "right"


def test_correct_answers_are_spread_across_positions(seeded):
    positions = {q.answer for q in seeded.scalars(select(Question))}
    assert positions == {0, 1, 2, 3}


def test_seeding_is_idempotent(seeded):
    load_all(seeded)
    assert seeded.scalar(select(func.count()).select_from(Subject)) == 1
    assert seeded.scalar(select(func.count()).select_from(Topic)) == len(dsa_data()["topics"])
    assert seeded.scalar(select(func.count()).select_from(Question)) == sum(
        len(t["questions"]) for t in dsa_data()["topics"]
    )


def test_seeding_applies_edits(seeded):
    data = dsa_data()
    data["topics"][1]["name"] = "Arrays (renamed)"
    load_subject(seeded, data)
    assert seeded.scalar(select(Topic.name).where(Topic.slug == "arrays")) == "Arrays (renamed)"


def test_content_requires_auth(client, seeded):
    assert client.get("/api/v1/subjects").status_code == 401


def test_list_topics_in_prerequisite_order(client, seeded, auth_headers):
    subjects = client.get("/api/v1/subjects", headers=auth_headers).json()
    assert [s["slug"] for s in subjects] == ["dsa"]

    topics = client.get(f"/api/v1/subjects/{subjects[0]['id']}/topics", headers=auth_headers).json()
    seen: set[int] = set()
    for t in topics:
        assert set(t["prerequisite_ids"]) <= seen, f"{t['slug']} listed before its prerequisites"
        seen.add(t["id"])
    assert topics[0]["slug"] == "complexity"


def test_topic_detail_and_resources(client, seeded, auth_headers):
    topic_id = seeded.scalar(select(Topic.id).where(Topic.slug == "bst"))
    topic = client.get(f"/api/v1/topics/{topic_id}", headers=auth_headers).json()
    prereq_slugs = set(seeded.scalars(select(Topic.slug).where(Topic.id.in_(topic["prerequisite_ids"]))))
    assert prereq_slugs == {"trees", "searching"}

    resources = client.get(f"/api/v1/topics/{topic_id}/resources", headers=auth_headers).json()
    assert {r["type"] for r in resources} >= {"notes", "link"}

    assert client.get("/api/v1/topics/99999", headers=auth_headers).status_code == 404
