from purffle_shorts.cli import _confirm_divergence, build_parser, build_settings, main, print_result
from purffle_shorts.pipeline import Result, Studio


def test_providers_command(capsys, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    assert main(["providers"]) == 0
    out = capsys.readouterr().out
    assert "anthropic" in out and "ollama" in out


def test_overrides_from_flags(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    args = build_parser().parse_args(["make", "--lang", "es", "--visuals", "pexels,Pollinations", "--no-upload",
                                      "--resolution", "720x1280", "--duration", "500", "--no-music"])
    s = build_settings(args)
    assert s.language == "es" and s.visual_sources == ["pexels", "pollinations"]
    assert s.upload is False and s.resolution == (720, 1280)
    assert s.target_seconds == 170 and s.music_volume == 0.0


def test_live_line_shows_stage_percent_and_time_left():
    import io
    import logging

    from purffle_shorts import cli
    out = io.StringIO()
    line = cli.LiveLine(out)
    line.eta_fn = lambda: 75.0
    line("render", 50, "1080x1920")
    text = out.getvalue()
    assert "Render" in text and " 50%" in text and "1:15 left" in text and "1080x1920" in text
    handler = cli._Console(out)
    cli._Console.live = line
    try:
        handler.emit(logging.LogRecord("purffle", logging.INFO, __file__, 1, "Voice ready", None, None))
    finally:
        cli._Console.live = None
    after = out.getvalue()[len(text):]
    assert after.startswith("\r\033[K") and "Voice ready" in after and after.rstrip().endswith("1080x1920")


class _Topic:
    def __init__(self, subject):
        self.subject = subject


class _Script:
    def __init__(self, topic):
        self.topic = topic


def test_confirm_divergence_defaults_to_no_when_noninteractive(monkeypatch):
    # Non-interactive runs (cron, CI) must never ship an unreviewed angle: default to "no" and
    # never even try to read from stdin.
    monkeypatch.setattr("sys.stdin.isatty", lambda: False)

    def boom(*a, **k):
        raise AssertionError("must not prompt when non-interactive")
    monkeypatch.setattr("builtins.input", boom)
    assert _confirm_divergence(_Script("Octopus hearts"), _Topic("Why do airplanes fly"), "manual") is False


def test_confirm_divergence_prompts_and_honors_answer_when_interactive(monkeypatch, capsys):
    monkeypatch.setattr("sys.stdin.isatty", lambda: True)
    monkeypatch.setattr("builtins.input", lambda prompt="": "y")
    assert _confirm_divergence(_Script("Octopus hearts"), _Topic("Why do airplanes fly"), "manual") is True
    out = capsys.readouterr().out
    assert "Why do airplanes fly" in out and "Octopus hearts" in out

    monkeypatch.setattr("builtins.input", lambda prompt="": "n")
    assert _confirm_divergence(_Script("Octopus hearts"), _Topic("Why do airplanes fly"), "manual") is False


def test_print_result_needs_review_message(capsys):
    print_result(Result(False, "Why Octopuses Have Three Hearts", status="needs_review"))
    out = capsys.readouterr().out
    assert "needs review" in out.lower()


def test_cmd_run_passes_interactive_gate_for_single_worker_manual_topic(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    calls = []
    monkeypatch.setattr(Studio, "autopilot", lambda self, **kw: calls.append(kw) or 0)
    assert main(["run", "--once", "--topic", "space", "--workers", "1"]) in (0, 1)
    assert calls[0]["on_divergence"] is _confirm_divergence


def test_cmd_run_never_passes_interactive_gate_for_multiple_workers(tmp_path, monkeypatch):
    # With more than one worker, autopilot's thread pool could run several `make()` calls at
    # once — handing it an interactive confirm callback here would risk concurrent input() calls.
    monkeypatch.chdir(tmp_path)
    calls = []
    monkeypatch.setattr(Studio, "autopilot", lambda self, **kw: calls.append(kw) or 0)
    assert main(["run", "--once", "--topic", "space", "--workers", "3"]) in (0, 1)
    assert calls[0]["on_divergence"] is None


def test_cmd_run_never_passes_interactive_gate_without_a_manual_topic(tmp_path, monkeypatch):
    # Topics from the niche/idea queue have no original subject to diverge from — nothing for a
    # gate to confirm.
    monkeypatch.chdir(tmp_path)
    calls = []
    monkeypatch.setattr(Studio, "autopilot", lambda self, **kw: calls.append(kw) or 0)
    assert main(["run", "--once", "--workers", "1"]) in (0, 1)
    assert calls[0]["on_divergence"] is None
