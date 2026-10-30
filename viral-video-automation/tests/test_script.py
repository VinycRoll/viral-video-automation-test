import json
from pathlib import Path

import pytest

from purffle_shorts.config import Settings
from purffle_shorts.llm import extract_json
from purffle_shorts.script import SCRIPT_SCHEMA, build_prompt, load_script, normalize, offline_script, topic_divergence


@pytest.mark.parametrize("text", [
    '{"a": 1}',
    '```json\n{"a": 1}\n```',
    'Sure! Here it is:\n{"a": 1}\nHope that helps.',
    '{"a": 1,}',
])
def test_extract_json_variants(text):
    assert extract_json(text) == {"a": 1}


def test_normalize_cleans_everything():
    data = {
        "topic": "Octopus", "title": '"Octopus Secrets" #shorts 🐙', "hook_text": "3 HEARTS?!",
        "scenes": [
            {"narration": "[Hook] Narrator: Octopuses have three hearts! 🐙 #facts", "search_query": "octopus",
             "image_prompt": "an octopus"},
            {"narration": "", "search_query": "x", "image_prompt": "x"},
            "Plain string scene works too.",
        ],
        "description": "Wow. #octopus", "hashtags": ["octopus", "#Ocean Life", "#shorts", "#octopus"],
        "tags": ["a" * 70] + [f"tag{i}" for i in range(200)], "category": "nonsense",
    }
    s = normalize(data, "octopus", "facts", "en")
    assert s.scenes[0].narration == "Octopuses have three hearts!"
    assert len(s.scenes) == 2
    assert s.title == "Octopus Secrets"
    assert s.hashtags[0] == "#shorts" and "#OceanLife" in s.hashtags
    assert len([h for h in s.hashtags if h.lower() == "#octopus"]) == 1
    assert sum(len(t) + 1 for t in s.tags) <= 500
    assert s.category == "education" and s.category_id == "27"
    assert "#" not in s.description


def test_normalize_merges_too_many_scenes():
    data = {"scenes": [{"narration": f"Sentence {i}.", "search_query": "q", "image_prompt": "p"} for i in range(20)]}
    s = normalize(data, "x", "facts", "en")
    assert len(s.scenes) == 12
    assert s.narration.count("Sentence") == 20


def test_offline_script_is_complete():
    s = offline_script("", Settings())
    assert s.title and len(s.scenes) >= 4 and s.hashtags[0] == "#shorts"


def test_prompt_mentions_language_and_length():
    system, user = build_prompt("space", "facts", Settings(language="es", target_seconds=30), ["Old title"])
    assert "Spanish" in user and "78 words" in user and "Old title" in user
    assert "JSON" in system
    assert set(SCRIPT_SCHEMA["required"]) >= {"title", "scenes", "hashtags"}


def test_load_script_cleans_like_an_ai_script(tmp_path):
    f = tmp_path / "mine.json"
    f.write_text(json.dumps({"title": "My Own Script #viral", "style": "not-a-style", "hashtags": ["cats"],
                             "scenes": [{"narration": "Cats sleep a lot.", "search_query": "sleeping cat"}]}))
    sc = load_script(f, Settings())
    assert sc.title == "My Own Script" and sc.style == "facts"
    assert sc.hashtags[:2] == ["#shorts", "#cats"] and sc.topic == "My Own Script #viral"
    assert sc.scenes[0].image_prompt == "sleeping cat"


def test_load_script_rejects_non_objects(tmp_path):
    f = tmp_path / "bad.json"
    f.write_text("[1, 2]")
    with pytest.raises(ValueError):
        load_script(f, Settings())


@pytest.mark.parametrize("path", sorted((Path(__file__).parent.parent / "examples").glob("*.json")))
def test_shipped_examples_load(path):
    sc = load_script(path, Settings())
    assert len(sc.scenes) >= 4 and sc.hook_text and all(s.image_prompt for s in sc.scenes)


def test_narration_cleanup_turns_dashes_into_clean_pauses():
    from purffle_shorts.utils import clean_narration
    assert clean_narration("packed with copper — not iron.") == "packed with copper, not iron."
    assert clean_narration("blue–green , really ?") == "blue, green, really?"
    assert clean_narration("It ends here —.") == "It ends here."
    assert clean_narration("[Hook] Wow! #facts 🐙") == "Wow!"


# ------------------------------------------------------------------ topic fidelity
def test_topic_divergence_flags_unrelated_angle():
    d = topic_divergence("How AI helps us in our daily lives", "AI predicts severe weather before meteorologists")
    assert d["diverges"] is True


def test_topic_divergence_flags_specific_example_within_broad_subject():
    # A broad subject narrowed down to one concrete example (giant squid, within "mysteries of the
    # deep ocean") now requires approval too: the topic adds a lot of content the subject never
    # mentioned, which a bag-of-words heuristic can't safely tell apart from a material focus
    # change (e.g. "benefits of green tea" -> "how green tea lowers blood pressure", which must
    # also be flagged). Preferring a review prompt over a silent guess is the safer default.
    d = topic_divergence("mysteries of the deep ocean", "the giant squid lurking in the deep ocean")
    assert d["relation"] == "narrower" and d["diverges"] is True


def test_topic_divergence_allows_already_specific_topic():
    d = topic_divergence("why octopuses have three hearts", "why octopuses have three hearts")
    assert d["diverges"] is False


def test_topic_divergence_not_literal_string_match():
    # Different wording, same meaning: should NOT be flagged just because the strings differ.
    d = topic_divergence("why octopuses have three hearts", "the three hearts of an octopus explained")
    assert d["diverges"] is False


def test_topic_divergence_relation_equivalent_for_rephrasing():
    d = topic_divergence("AI in our daily lives", "AI in everyday life")
    assert d["relation"] == "equivalent" and d["diverges"] is False


def test_topic_divergence_relation_narrower_but_still_flagged():
    # The topic keeps the subject's one real word ("tea") and builds a lot of new specific
    # content on top of it: a real (if partial) connection, so "narrower" rather than "divergent",
    # but still flagged since the focus has materially changed.
    d = topic_divergence("tea", "green tea ceremonies in Japan")
    assert d["relation"] == "narrower" and d["diverges"] is True


def test_topic_divergence_relation_divergent_for_unrelated_angle():
    d = topic_divergence("How AI helps us in our daily lives", "AI predicts severe weather before meteorologists")
    assert d["relation"] == "divergent" and d["diverges"] is True


def test_topic_divergence_relation_divergent_for_short_unrelated_subject():
    # Audit example: a short/broad subject with zero word overlap used to be assumed "narrower"
    # just because it was short — wrongly, since "cooking recipes" has nothing to do with "space".
    # Zero overlap must mean "divergent" regardless of how short the subject is.
    d = topic_divergence("space", "cooking recipes")
    assert d["relation"] == "divergent" and d["diverges"] is True


def test_topic_divergence_flags_narrowing_disguised_as_rephrasing():
    # Audit example: enough shared words ("green", "tea") to look like equivalence under a
    # single-overlap-ratio check, but the topic narrows "benefits" (general) down to one specific
    # physiological effect — new, specific content the subject never asked about.
    d = topic_divergence("benefits of green tea", "how green tea lowers blood pressure")
    assert d["diverges"] is True


def test_topic_divergence_flags_specific_instance_of_a_general_activity():
    # Audit example: "puppy house training" is a plausible material narrowing of "dog training"
    # (a specific dog, a specific skill), not a harmless rephrasing, so it must require approval.
    d = topic_divergence("dog training", "puppy house training")
    assert d["diverges"] is True


def test_topic_divergence_requires_approval_for_space_to_black_holes():
    d = topic_divergence("space", "black holes")
    assert d["diverges"] is True


def test_topic_divergence_equivalent_for_ai_daily_life_rephrasing():
    # Audit false positive: a longer subject with extra filler words ("helps us in our") lowered
    # recall just enough to wrongly require approval for a harmless rephrasing.
    d = topic_divergence("How AI helps us in our daily lives", "AI in everyday life")
    assert d["relation"] == "equivalent" and d["diverges"] is False


def test_build_prompt_pin_subject_forbids_narrowing():
    _, user = build_prompt("space", "facts", Settings(), [])
    assert "choose ONE specific" in user
    _, pinned = build_prompt("space", "facts", Settings(), [], pin_subject=True)
    assert "Stay exactly on this subject" in pinned
    assert "choose ONE specific" not in pinned
