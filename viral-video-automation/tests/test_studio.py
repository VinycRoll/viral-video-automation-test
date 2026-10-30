"""The Studio web app's server: security checks, the JSON API and a real (offline) job."""

import http.client
import json
import logging
import re
import threading
import time
from http.server import ThreadingHTTPServer
from pathlib import Path

import pytest

from purffle_shorts import pipeline as P
from purffle_shorts import studio as ST

from .conftest import needs_ffmpeg


@pytest.fixture
def server(settings):
    app = ST.StudioServer(settings.with_overrides(upload=False))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), ST._handler(app, "127.0.0.1"))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield app, httpd.server_address[1]
    httpd.shutdown()
    httpd.server_close()
    root = logging.getLogger()
    for h in [h for h in root.handlers if isinstance(h, ST._JobLog)]:
        root.removeHandler(h)


def req(port, method, path, body=None, token=None, host=None):
    c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    headers = {"Content-Type": "application/json"}
    if token:
        headers["X-Studio-Token"] = token
    if host:
        headers["Host"] = host
    c.request(method, path, body=json.dumps(body) if body is not None else None, headers=headers)
    r = c.getresponse()
    data = r.read()
    c.close()
    return r.status, dict(r.getheaders()), data


def test_page_has_token_and_strict_csp(server):
    app, port = server
    status, headers, body = req(port, "GET", "/")
    assert status == 200 and app.token.encode() in body and b"__TOKEN__" not in body
    assert "default-src 'self'" in headers["Content-Security-Policy"]
    assert "unsafe-inline" not in headers["Content-Security-Policy"]
    assert req(port, "GET", "/static/app.js")[0] == 200
    assert req(port, "GET", "/static/../studio.py")[0] == 404


def test_other_host_names_are_refused(server):
    app, port = server
    assert req(port, "GET", "/api/info", host="evil.example:8765")[0] == 421
    assert req(port, "GET", "/api/info", host=f"localhost:{port}")[0] == 200


def test_writes_need_the_token(server):
    app, port = server
    assert req(port, "POST", "/api/ideas", {"subject": "x"})[0] == 403
    status, _, body = req(port, "POST", "/api/ideas", {"subject": "Why cats purr", "style": "facts"}, app.token)
    assert status == 200
    iid = json.loads(body)["id"]
    ideas = json.loads(req(port, "GET", "/api/ideas")[2])["pending"]
    assert [(i["id"], i["style"]) for i in ideas] == [(iid, "facts")]
    req(port, "POST", f"/api/ideas/{iid}/delete", {}, app.token)
    assert json.loads(req(port, "GET", "/api/ideas")[2])["pending"] == []


def test_options_and_doctor(server):
    app, port = server
    opts = json.loads(req(port, "GET", "/api/options")[2])
    assert {"chat", "dialogue"} <= set(opts["styles"]) and "16:9" in opts["aspects"]
    checks = json.loads(req(port, "GET", "/api/doctor")[2])
    assert any(c["label"] == "Python" for c in checks)


def test_form_values_are_validated(server):
    app, _ = server
    s = app.overrides({"caption_style": "<script>", "aspect": "16:9", "duration": "999", "review": "rewrite",
                       "grade": "cinematic", "visuals": ["pollinations"], "music": False, "tts": "rm -rf"})
    assert s.caption_style == app.settings.caption_style and s.resolution == (1920, 1080)
    assert s.target_seconds == 170 and s.color_grade == "cinematic" and s.visual_sources == ["pollinations"]
    assert s.music_volume == 0.0 and s.tts_engine == app.settings.tts_engine


def test_offline_draft_job_runs_to_completion(server):
    app, port = server
    status, _, body = req(port, "POST", "/api/draft", {"offline": True, "style": "chat"}, app.token)
    jid = json.loads(body)["job"]
    for _ in range(100):
        job = json.loads(req(port, "GET", f"/api/jobs/{jid}")[2])
        if job["status"] in ("done", "failed"):
            break
        time.sleep(0.05)
    assert job["status"] == "done", job
    assert job["result"]["script"]["style"] == "chat" and job["pct"] == 100
    assert job["label"] == "Demo video"


def _job(port, jid, until=("done", "failed", "cancelled"), tries=600):
    for _ in range(tries):
        job = json.loads(req(port, "GET", f"/api/jobs/{jid}")[2])
        if job["status"] in until:
            return job
        time.sleep(0.05)
    return job


class _FakeLLM:
    """Always writes about "Octopus hearts", no matter what subject it's asked for — used to
    exercise the topic-divergence gate without touching a real LLM."""
    def __init__(self, settings):
        self.providers, self.label = [object()], "fake:model"

    def complete_json(self, system, user, schema=None, max_tokens=4000):
        return json.loads(json.dumps({
            "topic": "Octopus hearts", "title": "Why Octopuses Have Three Hearts", "hook_text": "3 HEARTS?!",
            "scenes": [{"narration": "An octopus has three hearts.", "search_query": "octopus",
                       "image_prompt": "octopus"}],
            "description": "Three hearts, one octopus.", "hashtags": ["#octopus"], "tags": ["octopus"],
            "category": "science",
        }))


def _run_job(port, token, path, body, timeout=5.0):
    status, _, resp = req(port, "POST", path, body, token)
    jid = json.loads(resp)["job"]
    deadline = time.time() + timeout
    while time.time() < deadline:
        job = json.loads(req(port, "GET", f"/api/jobs/{jid}")[2])
        if job["status"] in ("done", "failed", "needs_review"):
            return job
        time.sleep(0.05)
    return job


def test_event_stream_pushes_job_changes(server):
    app, port = server
    c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    c.request("GET", "/api/events")
    r = c.getresponse()
    assert r.status == 200 and r.getheader("Content-Type").startswith("text/event-stream")
    jid = json.loads(req(port, "POST", "/api/draft", {"offline": True}, app.token)[2])["job"]
    seen = set()
    deadline = time.time() + 15
    while time.time() < deadline and "done" not in seen:
        line = r.fp.readline().decode()
        if line.startswith("data: "):
            jobs = json.loads(line[6:])
            seen |= {j["status"] for j in jobs if j["id"] == jid}
    c.close()
    assert "done" in seen  # the finished job arrived on the stream, without polling


def test_a_running_job_can_be_cancelled(server, monkeypatch):
    from purffle_shorts import pipeline as P
    from purffle_shorts.utils import CANCEL
    app, port = server
    started = threading.Event()
    real_step = P.Studio._step

    def slow_step(self, stage, message=""):
        if stage == "voice":
            started.set()
            for _ in range(200):  # stand-in for a long stage that checks for cancellation
                if CANCEL.is_set():
                    break
                time.sleep(0.02)
        return real_step(self, stage, message)
    monkeypatch.setattr(P.Studio, "_step", slow_step)
    jid = json.loads(req(port, "POST", "/api/make", {"offline": True}, app.token)[2])["job"]
    assert started.wait(10)
    assert json.loads(req(port, "POST", f"/api/jobs/{jid}/cancel", {}, app.token)[2])["ok"]
    job = _job(port, jid)
    assert job["status"] == "cancelled", job
    assert app.studio.history.recent(5) == []  # nothing half-made was left in the library
    assert not CANCEL.is_set()                 # the next job starts clean


def test_password_protects_everything(settings):
    app = ST.StudioServer(settings.with_overrides(upload=False))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), ST._handler(app, "127.0.0.1", password="s3cret"))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    port = httpd.server_address[1]
    try:
        status, headers, _ = req(port, "GET", "/api/info")
        assert status == 401 and "Basic" in headers["WWW-Authenticate"]
        import base64
        good = "Basic " + base64.b64encode(b"me:s3cret").decode()
        bad = "Basic " + base64.b64encode(b"me:nope").decode()
        c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
        c.request("GET", "/api/info", headers={"Authorization": bad})
        assert c.getresponse().status == 401
        c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
        c.request("GET", "/api/info", headers={"Authorization": good})
        assert c.getresponse().status == 200
    finally:
        httpd.shutdown()
        httpd.server_close()
        root = logging.getLogger()
        for h in [h for h in root.handlers if isinstance(h, ST._JobLog)]:
            root.removeHandler(h)


def test_running_jobs_report_an_eta(server):
    app, port = server
    app.studio.clock.avg.update({"voice": 2.0, "render": 4.0})  # as if the machine had made videos before
    st = app.studio
    st._begin(["voice", "footage", "captions", "render", "check", "done"])
    st._step("voice")
    eta = st.eta()
    assert eta is not None and eta > 4.0
    st._t_start -= 10  # ten seconds into the job
    st._step("render")
    st._sub(0.5)
    assert st.eta() == 3.0  # the second half of render (2 s) + the default 1 s for the check
    assert 0 < st._pct < 100


def test_bundled_fonts_and_brand_assets_are_served(server):
    app, port = server
    status, headers, body = req(port, "GET", "/static/fonts/SchibstedGrotesk.woff2")
    assert status == 200 and headers["Content-Type"] == "font/woff2" and body[:4] == b"wOF2"
    assert "max-age" in headers["Cache-Control"]
    assert req(port, "GET", "/static/fonts/JetBrainsMono.woff2")[0] == 200
    assert req(port, "GET", "/static/fonts/missing.woff2")[0] == 404
    assert req(port, "GET", "/static/fonts/../app.js")[0] == 404
    status, headers, body = req(port, "GET", "/static/icon.svg")
    assert status == 200 and b"<svg" in body


def test_page_has_no_inline_styles_or_scripts(server):
    """The Content-Security-Policy forbids inline styles and scripts, so the markup must not use them."""
    import re
    app, port = server
    html = req(port, "GET", "/")[2].decode()
    js = req(port, "GET", "/static/app.js")[2].decode()
    assert not re.search(r"\sstyle=", html) and not re.search(r"<script>(?!\s*</script>)", html)
    assert not re.search(r"""\sstyle=["']""", js)


def test_make_job_needs_review_for_diverging_manual_topic(server, monkeypatch):
    app, port = server
    monkeypatch.setattr(P, "LLM", _FakeLLM)
    job = _run_job(port, app.token, "/api/make", {"topic": "Why do airplanes fly"})
    assert job["status"] == "needs_review", job
    assert job["result"]["subject"] == "Why do airplanes fly"
    assert job["result"]["divergence"]["diverges"] is True
    assert job["result"]["script"]["topic"] == "Octopus hearts"


def test_draft_job_surfaces_subject_and_divergence(server, monkeypatch):
    app, port = server
    monkeypatch.setattr(P, "LLM", _FakeLLM)
    job = _run_job(port, app.token, "/api/draft", {"topic": "Why do airplanes fly"})
    assert job["status"] == "done", job
    assert job["result"]["subject"] == "Why do airplanes fly"
    assert job["result"]["divergence"]["diverges"] is True


_SCRIPT_DATA = {
    "topic": "Octopus hearts", "title": "Why Octopuses Have Three Hearts", "hook_text": "3 HEARTS?!",
    "scenes": [{"narration": "An octopus has three hearts.", "search_query": "octopus", "image_prompt": "octopus"}],
    "description": "Three hearts, one octopus.", "hashtags": ["#octopus"], "tags": ["octopus"], "category": "science",
}


def test_make_job_blocks_script_render_without_approval(server):
    app, port = server
    job = _run_job(port, app.token, "/api/make",
                   {"topic": "Why do airplanes fly", "script": _SCRIPT_DATA, "offline": True})
    assert job["status"] == "needs_review", job
    assert job["result"]["subject"] == "Why do airplanes fly"
    assert job["result"]["script"]["topic"] == "Octopus hearts"


def test_make_job_rejects_stale_approval_after_topic_edit(server):
    app, port = server
    edited = dict(_SCRIPT_DATA, topic="Why cats purr when happy")
    job = _run_job(port, app.token, "/api/make", {
        "topic": "Why do airplanes fly", "script": edited, "offline": True,
        "approved_subject": "Why do airplanes fly", "approved_topic": "Octopus hearts",
    })
    assert job["status"] == "needs_review", job


def test_make_job_with_unrecoverable_empty_subject_needs_review(server):
    # An old draft whose original subject can't be recovered from any metadata ends up with
    # subject == "" — this must still be flagged for review, never treated as auto-approved.
    app, port = server
    job = _run_job(port, app.token, "/api/make", {"script": _SCRIPT_DATA, "offline": True})
    assert job["status"] == "needs_review", job
    assert job["result"]["subject"] == ""


@needs_ffmpeg
def test_make_job_can_explicitly_approve_unrecoverable_empty_subject(server):
    # Once a human explicitly approves that exact (empty subject, script topic) pair, it must
    # actually render — not loop back into needs_review forever just because subject is "".
    app, port = server
    job = _run_job(port, app.token, "/api/make", {
        "script": _SCRIPT_DATA, "offline": True,
        "approved_subject": "", "approved_topic": _SCRIPT_DATA["topic"],
    }, timeout=60.0)
    assert job["status"] == "done", job


@needs_ffmpeg
def test_make_job_renders_script_with_matching_approval(server):
    app, port = server
    job = _run_job(port, app.token, "/api/make", {
        "topic": "Why do airplanes fly", "script": _SCRIPT_DATA, "offline": True,
        "approved_subject": "Why do airplanes fly", "approved_topic": "Octopus hearts",
    }, timeout=60.0)
    assert job["status"] == "done", job


# ------------------------------------------------------------------ Storyboard
def test_storyboard_card_renders_scene_number_narration_and_media_status():
    src = Path(__file__).parent.parent / "purffle_shorts" / "web" / "app.js"
    text = src.read_text(encoding="utf-8")
    assert "function storyboardCard(s, n)" in text
    assert 'storyboard">${d.scenes.map((s, n) => storyboardCard(s, n))' in text
    # empty-state: a script with no scenes yet must not render an empty grid
    assert "No scenes yet" in text
    fn_start = text.index("function storyboardCard(s, n)")
    fn_body = text[fn_start:text.index("function drawEditor", fn_start)]
    assert "No visual source" in fn_body and "Not verified yet" in fn_body
    assert "s.narration" in fn_body


# ------------------------------------------------------------------ Library "Edit & re-render" flow
def test_library_edit_handler_recovers_the_original_subject():
    # app.js has no test runner of its own, so this guards the one-line fix directly: the
    # "Edit & re-render" button used to build S.draft from the script alone, with no `_subject` at
    # all — so re-rendering an edited library video always sent topic: "" and could never be
    # checked against the video's real original subject, nor correctly re-flag a material edit.
    src = Path(__file__).parent.parent / "purffle_shorts" / "web" / "app.js"
    text = src.read_text(encoding="utf-8")
    start = text.index("const ed = $(\"#d-edit\")")
    handler = text[start:text.index("saveDraft();", start)]
    assert re.search(r"_subject\s*:\s*v\.subject\s*\|\|\s*m\.subject\s*\|\|\s*sc\.topic", handler)
    assert "_divergence: null" in handler
    assert "_approved_subject: null" in handler and "_approved_topic: null" in handler
