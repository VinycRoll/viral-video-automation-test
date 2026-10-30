"""The keyed path end to end with fakes: LLM -> Pexels search + download -> render -> upload/schedule/queue."""

import json
import subprocess

import pytest

from purffle_shorts import ffmpeg
from purffle_shorts import media as M
from purffle_shorts import pipeline as P
from purffle_shorts import utils as U

from .conftest import needs_ffmpeg

SCRIPT = {
    "topic": "Octopus hearts", "title": "Why Octopuses Have Three Hearts", "hook_text": "3 HEARTS?!",
    "scenes": [
        {"narration": "An octopus has three hearts.", "search_query": "octopus", "image_prompt": "octopus"},
        {"narration": "Two pump blood through the gills.", "search_query": "octopus gills", "image_prompt": "gills"},
        {"narration": "Follow for more ocean facts.", "search_query": "ocean", "image_prompt": "ocean"},
    ],
    "description": "Three hearts, one octopus.", "hashtags": ["#octopus"], "tags": ["octopus"],
    "category": "science",
}


class FakeLLM:
    def __init__(self, settings):
        self.providers, self.label = [object()], "fake:model"

    def complete_json(self, system, user, schema=None, max_tokens=4000, temperature=None):
        assert "JSON" in system
        return json.loads(json.dumps(SCRIPT))


class Resp:
    def __init__(self, data=None, path=None):
        self.status_code, self._data, self._path, self.text = 200, data, path, ""

    def json(self):
        return self._data

    def iter_content(self, chunk_size=65536):
        with open(self._path, "rb") as f:
            while chunk := f.read(chunk_size):
                yield chunk

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


@pytest.fixture
def clip(tmp_path):
    path = tmp_path / "clip.mp4"
    subprocess.run([ffmpeg.ffmpeg_bin(), "-v", "error", "-f", "lavfi", "-i", "testsrc2=s=640x360:r=25:d=6",
                    "-pix_fmt", "yuv420p", str(path)], check=True)
    return path


@pytest.fixture
def online(settings, monkeypatch, clip):
    searches = []

    class Session:
        def get(self, url, params=None, headers=None, timeout=None, stream=False):
            if "api.pexels.com/videos/search" in url:
                searches.append(params["query"])
                base = abs(hash(params["query"])) % 1000 * 10
                vids = [{"id": base + i, "duration": 6, "user": {"name": "Ann"},
                         "video_files": [{"link": f"http://fake/{base + i}.mp4", "width": 640, "height": 360,
                                          "file_type": "video/mp4"}]} for i in range(2)]
                return Resp({"videos": vids})
            if url.startswith("http://fake/"):
                return Resp(path=clip)
            raise AssertionError(f"unexpected request {url}")

    monkeypatch.setattr(M, "http", lambda: Session())
    monkeypatch.setattr(U, "http", lambda: Session())
    monkeypatch.setattr(P, "LLM", FakeLLM)
    s = settings.with_overrides(tts_engine="silent", resolution=(360, 640), fps=24, music_volume=0.0,
                                visual_sources=["pexels"], pexels_api_key="k", upload=True)
    return s, searches


@needs_ffmpeg
def test_keyed_pipeline_uploads_and_dedupes(online, monkeypatch):
    s, searches = online
    uploads = []
    monkeypatch.setattr(P.youtube, "upload", lambda settings, video, body: uploads.append(body) or {"id": "vid1"})
    studio = P.Studio(s)
    r = studio.make()
    assert r.ok, r.error
    assert r.status == "uploaded" and r.youtube_id == "vid1"
    assert searches[:1] == ["octopus"]
    body = uploads[0]
    assert body["snippet"]["title"] == "Why Octopuses Have Three Hearts #shorts"
    assert body["snippet"]["categoryId"] == "28"
    assert "Footage: Pexels" in body["snippet"]["description"]
    assert not r.video.exists()                        # KEEP_VIDEOS=false removes the MP4 after upload
    used = studio.history.used_media()
    assert len(used) == 3 and all(k.startswith("pexels:") for k in used)


@needs_ffmpeg
def test_schedule_and_quota_queue(online, monkeypatch):
    s, _ = online
    monkeypatch.setattr(P.youtube, "upload", lambda settings, video, body: {"id": "v"})
    s = s.with_overrides(publish_times=["09:00", "21:00"], keep_videos=True, daily_upload_limit=1)
    studio = P.Studio(s)
    first = studio.make()
    assert first.status == "scheduled" and first.publish_at
    second = studio.make()
    assert second.status == "queued" and second.video.exists()
    assert [row["id"] for row in studio.history.pending_uploads()] == [second.record_id]


@needs_ffmpeg
def test_youtube_refusal_pauses_uploads_until_the_reset(online, monkeypatch):
    s, _ = online
    calls = []

    def refuse(settings, video, body):
        calls.append(video)
        raise P.youtube.QuotaExceeded("uploadLimitExceeded")
    monkeypatch.setattr(P.youtube, "upload", refuse)
    studio = P.Studio(s.with_overrides(keep_videos=True))
    first, second = studio.make(), studio.make()
    assert first.status == second.status == "queued" and len(calls) == 1  # the second one was not even tried
    assert studio.quota_left() == 0                                     # so autopilot sleeps instead of piling up
    assert len(studio.history.pending_uploads()) == 2


# ------------------------------------------------------------------ topic fidelity (manual topics only)
def test_draft_flags_divergence_for_manual_topic(online):
    s, _ = online
    pick = P.Studio(s).draft("Why do airplanes fly")[1]
    assert pick.subject == "Why do airplanes fly"            # the original theme is preserved, not overwritten
    assert pick.source == "manual"
    assert pick.divergence["diverges"] is True


def test_draft_no_divergence_for_already_specific_topic(online):
    s, _ = online
    # FakeLLM always returns a script whose "topic" is "Octopus hearts" — asking for exactly that
    # subject is the "doesn't need clarification" case.
    pick = P.Studio(s).draft("Octopus hearts")[1]
    assert pick.divergence["diverges"] is False


def test_draft_skips_divergence_for_non_manual_topic(online):
    s, _ = online
    pick = P.Studio(s).draft(source="niche")[1]
    assert pick.source != "manual"
    assert pick.divergence is None


def test_make_rejects_alternative_angle_without_producing(online):
    s, searches = online
    studio = P.Studio(s)
    seen = []

    def reject(script, pick, writer):
        seen.append((script.topic, pick.subject))
        return False
    r = studio.make("Why do airplanes fly", on_divergence=reject)
    assert r.status == "needs_review" and r.ok is False
    assert seen == [("Octopus hearts", "Why do airplanes fly")]
    assert searches == []                                      # no footage search: nothing was produced


@needs_ffmpeg
def test_make_approves_alternative_angle_and_produces(online):
    s, _ = online
    studio = P.Studio(s)
    r = studio.make("Why do airplanes fly", upload=False, on_divergence=lambda *a: True)
    assert r.ok, r.error
    meta = json.loads((r.folder / "metadata.json").read_text())
    assert meta["subject"] == "Why do airplanes fly"           # original theme recorded even though approved
    assert meta["topic"] == "Octopus hearts"
    assert meta["topic_divergence"]["diverges"] is True


@needs_ffmpeg
def test_make_on_divergence_not_called_for_non_manual_topic(online):
    s, _ = online

    def boom(*a):
        raise AssertionError("on_divergence must not fire for non-manual topics")
    r = P.Studio(s).make(source="niche", upload=False, on_divergence=boom)
    assert r.ok, r.error


# ------------------------------------------------------------------ topic fidelity (script-provided renders)
def test_make_blocks_script_provided_render_without_approval(online):
    from purffle_shorts.script import script_from_data
    s, searches = online
    script = script_from_data(SCRIPT, s)
    r = P.Studio(s).make("Why do airplanes fly", script=script, on_divergence=lambda *a: False)
    assert r.status == "needs_review" and r.ok is False
    assert searches == []                                       # no footage search: nothing was produced


@needs_ffmpeg
def test_make_preserves_original_theme_for_script_provided_render(online):
    from purffle_shorts.script import script_from_data
    s, _ = online
    script = script_from_data(SCRIPT, s)
    r = P.Studio(s).make("Why do airplanes fly", upload=False, script=script, on_divergence=lambda *a: True)
    assert r.ok, r.error
    meta = json.loads((r.folder / "metadata.json").read_text())
    assert meta["subject"] == "Why do airplanes fly"            # original theme recorded, not discarded
    assert meta["topic"] == "Octopus hearts"                    # the script's actual (approved) angle
    assert meta["topic_divergence"]["diverges"] is True


@needs_ffmpeg
def test_make_script_provided_without_on_divergence_still_renders_and_records_subject(online):
    # Backward compatibility: CLI/MCP callers that pass a script without an on_divergence
    # callback must keep working exactly as before (no gate, same metadata as always).
    from purffle_shorts.script import script_from_data
    s, _ = online
    script = script_from_data(SCRIPT, s)
    r = P.Studio(s).make(script=script, upload=False)
    assert r.ok, r.error
    meta = json.loads((r.folder / "metadata.json").read_text())
    assert meta["subject"] == "Octopus hearts" and meta["topic"] == "Octopus hearts"


def test_make_script_provided_with_gate_but_no_topic_cannot_bypass_approval(online):
    # The actual bug being closed: a caller that DOES wire up an on_divergence gate (the web UI
    # and MCP server always do) must not be able to dodge it just by omitting `topic` — that used
    # to make `subject` default to the script's own topic, so the equality check always passed and
    # the gate was skipped entirely, no matter how it would have answered.
    from purffle_shorts.script import script_from_data
    s, searches = online
    script = script_from_data(SCRIPT, s)

    def boom(*a):
        raise AssertionError("on_divergence should be consulted, not bypassed")
    r = P.Studio(s).make(script=script, on_divergence=lambda *a: False)
    assert r.status == "needs_review" and r.ok is False
    assert searches == []                                      # nothing was produced


def test_make_script_provided_with_gate_but_no_topic_can_still_be_approved(online):
    # The flip side: the same missing-subject case can still proceed if the gate explicitly says
    # yes — it's flagged for review, not blocked outright.
    from purffle_shorts.script import script_from_data
    s, _ = online
    script = script_from_data(SCRIPT, s)
    seen = []

    def approve(script, pick, writer):
        seen.append(pick.subject)
        return True
    r = P.Studio(s).make(script=script, upload=False, on_divergence=approve)
    assert r.ok, r.error
    assert seen == [""]                                        # no original subject was ever given


# ------------------------------------------------------------------ approval decision persisted in history
@needs_ffmpeg
def test_history_records_divergence_and_approval_for_approved_manual_topic(online):
    s, _ = online
    studio = P.Studio(s)
    r = studio.make("Why do airplanes fly", upload=False, on_divergence=lambda *a: True)
    assert r.ok, r.error
    row = studio.history.get(r.record_id)
    assert row["subject"] == "Why do airplanes fly" and row["topic"] == "Octopus hearts"
    assert json.loads(row["topic_divergence"])["diverges"] is True
    assert bool(row["approval_required"]) is True and bool(row["approved"]) is True


@needs_ffmpeg
def test_history_records_no_approval_needed_when_topic_matches_subject(online):
    s, _ = online
    studio = P.Studio(s)
    r = studio.make(upload=False)
    assert r.ok, r.error
    row = studio.history.get(r.record_id)
    assert not row["approval_required"]
    assert row["approved"] is None


# ------------------------------------------------------------------ autopilot never silently approves
def test_autopilot_refuses_diverging_manual_topic_by_default(online):
    # autopilot runs batches in a thread pool, so it can't safely ask interactively — a manual
    # topic the LLM drifted away from must be skipped, not silently rendered or uploaded.
    s, searches = online
    produced = P.Studio(s).autopilot(count=1, once=True, upload=False, topic="Why do airplanes fly")
    assert produced == 0
    assert searches == []                                      # nothing was produced


@needs_ffmpeg
def test_autopilot_honors_an_explicit_on_divergence_gate(online):
    s, _ = online
    seen = []

    def approve(script, pick, writer):
        seen.append(pick.subject)
        return True
    produced = P.Studio(s).autopilot(count=1, once=True, upload=False, topic="Why do airplanes fly",
                                     on_divergence=approve)
    assert produced == 1
    assert seen == ["Why do airplanes fly"]


def test_autopilot_never_gates_topics_from_the_idea_queue(online):
    # Topics sourced from the niche/autopilot idea queue have no original subject, so the gate
    # must never even be consulted for them.
    s, _ = online

    def boom(*a):
        raise AssertionError("on_divergence must not fire for a non-manual topic")
    produced = P.Studio(s).autopilot(count=1, once=True, upload=False, source="niche", on_divergence=boom)
    assert produced == 1


@needs_ffmpeg
def test_history_records_unreviewed_divergence_when_no_gate_is_wired_in(online):
    # A caller that never passes on_divergence at all still renders (documented backward
    # compatibility), but history must not claim a human ever reviewed that decision.
    s, _ = online
    studio = P.Studio(s)
    r = studio.make("Why do airplanes fly", upload=False)
    assert r.ok, r.error
    row = studio.history.get(r.record_id)
    assert bool(row["approval_required"]) is True
    assert bool(row["approved"]) is False
