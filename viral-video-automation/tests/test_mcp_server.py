"""The MCP tools: make_short must not bypass the divergence gate, and draft_script must surface it."""

import json

from purffle_shorts import pipeline as P
from purffle_shorts.mcp_server import Server

from .conftest import needs_ffmpeg

_SCRIPT_DATA = {
    "topic": "Octopus hearts", "title": "Why Octopuses Have Three Hearts", "hook_text": "3 HEARTS?!",
    "scenes": [{"narration": "An octopus has three hearts.", "search_query": "octopus", "image_prompt": "octopus"}],
    "description": "Three hearts, one octopus.", "hashtags": ["#octopus"], "tags": ["octopus"], "category": "science",
}


class _FakeLLM:
    """Always writes about "Octopus hearts", no matter the requested subject."""
    def __init__(self, settings):
        self.providers, self.label = [object()], "fake:model"

    def complete_json(self, system, user, schema=None, max_tokens=4000):
        return json.loads(json.dumps(_SCRIPT_DATA))


def test_make_short_needs_review_without_approval(settings):
    server = Server(settings)
    out = server.make_short({"topic": "Why do airplanes fly", "script": _SCRIPT_DATA})
    assert "Needs review" in out
    assert "Why do airplanes fly" in out and "Octopus hearts" in out


def test_make_short_cannot_bypass_approval_by_omitting_topic(settings):
    # A script submitted with no topic at all must not be read as "nothing to compare against,
    # so it's fine" — that would let a script silently skip the gate just by leaving topic out.
    server = Server(settings)
    out = server.make_short({"script": _SCRIPT_DATA})
    assert "Needs review" in out
    assert "Octopus hearts" in out


@needs_ffmpeg
def test_make_short_renders_script_without_topic_once_approved(settings):
    server = Server(settings)
    out = server.make_short({"script": _SCRIPT_DATA, "approved_divergence": True, "demo": True})
    assert "Needs review" not in out
    assert "✔" in out


@needs_ffmpeg
def test_make_short_renders_with_approved_divergence(settings):
    server = Server(settings)
    out = server.make_short({"topic": "Why do airplanes fly", "script": _SCRIPT_DATA,
                             "approved_divergence": True, "demo": True})
    assert "Needs review" not in out
    assert "✔" in out


def test_draft_script_surfaces_subject_and_divergence(settings, monkeypatch):
    monkeypatch.setattr(P, "LLM", _FakeLLM)
    server = Server(settings)
    out = json.loads(server.draft_script({"topic": "Why do airplanes fly"}))
    assert out["subject"] == "Why do airplanes fly"
    assert out["divergence"]["diverges"] is True
    assert out["script"]["topic"] == "Octopus hearts"
