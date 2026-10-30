from purffle_shorts import media as M
from purffle_shorts.config import Settings


class R:
    def __init__(self, data):
        self.status_code, self._d, self.text = 200, data, ""

    def json(self):
        return self._d


class S:
    def __init__(self, data):
        self.data, self.params = data, []

    def get(self, url, params=None, headers=None, timeout=None):
        self.params.append(params)
        return R(self.data)


def test_pexels_file_choice_prefers_1080_not_4k():
    files = [
        {"link": "u4k", "width": 2160, "height": 3840, "file_type": "video/mp4"},
        {"link": "u1080", "width": 1080, "height": 1920, "file_type": "video/mp4"},
        {"link": "u720", "width": 720, "height": 1280, "file_type": "video/mp4"},
        {"link": "", "width": 1080, "height": 1920},
        {"link": "hls", "width": None, "height": None},
    ]
    assert M._pexels_pick_file(files, prefer_4k=False)["link"] == "u1080"
    assert M._pexels_pick_file(files, prefer_4k=True)["link"] == "u4k"
    assert M._pexels_pick_file(files[2:3], False)["link"] == "u720"


def test_pexels_videos_parse(monkeypatch):
    data = {"videos": [{"id": 7, "duration": 12, "user": {"name": "Ann"},
                        "video_files": [{"link": "a", "width": 1080, "height": 1920, "file_type": "video/mp4"}]}]}
    sess = S(data)
    monkeypatch.setattr(M, "http", lambda: sess)
    items = M.pexels_videos("octopus", "key")
    assert items[0].key == "pexels:7" and items[0].portrait and items[0].duration == 12
    assert sess.params[0]["orientation"] == "portrait"


def test_pixabay_prefers_medium(monkeypatch):
    data = {"hits": [{"id": 3, "duration": 9, "user": "bob", "videos": {
        "large": {"url": "L", "width": 3840, "height": 2160},
        "medium": {"url": "Md", "width": 1920, "height": 1080},
        "small": {"url": "", "width": 0, "height": 0}}}]}
    monkeypatch.setattr(M, "http", lambda: S(data))
    assert M.pixabay_videos("x", "k")[0].url == "Md"
    assert M.pixabay_videos("x", "k", prefer_4k=True)[0].url == "L"


def test_claim_skips_used_media():
    v = M.Visuals(Settings(), used_keys={"pexels:1"})
    a = M.MediaItem("pexels", "1", "video", width=1080, height=1920, duration=10)
    b = M.MediaItem("pexels", "2", "video", width=1920, height=1080, duration=10)
    assert v._claim([a, b], 5).key == "pexels:2"
    assert v._claim([a, b], 5) is None


def test_simplify_query():
    assert M.simplify_query("The octopus in the deep ocean") == "octopus deep"


def test_no_footage_falls_back_to_generated(tmp_path):
    v = M.Visuals(Settings(visual_sources=["local"], media_dir=str(tmp_path / "none")))
    item = v.for_scene(0, "octopus", "octopus", "sea", 3.0, tmp_path)
    assert item.kind == "generated"


def test_pollinations_payment_required_stops_asking(monkeypatch, tmp_path, caplog):
    calls = []

    def refuse(prompt, dest, width, height, key=""):
        calls.append(key)
        raise M.PermanentError("download https://image.pollinations.ai/...: HTTP 402 — {}")
    monkeypatch.setattr(M, "pollinations_image", refuse)
    v = M.Visuals(Settings(visual_sources=["pollinations"], pollinations_api_key="pk_x"))
    items = [v.for_scene(i, "cat", "a cat", "cats", 3.0, tmp_path) for i in range(4)]
    assert calls == ["pk_x"] and all(i.kind == "generated" for i in items)
    assert "POLLINATIONS_API_KEY" in caplog.text and caplog.text.count("refused") == 1


def test_pexels_items_carry_description_and_rank(monkeypatch):
    data = {"videos": [
        {"id": 1, "duration": 9, "url": "https://www.pexels.com/video/city-traffic-at-night-111/",
         "video_files": [{"link": "a", "width": 1080, "height": 1920, "file_type": "video/mp4"}]},
        {"id": 2, "duration": 9, "url": "https://www.pexels.com/video/an-octopus-swimming-in-the-sea-222/",
         "video_files": [{"link": "b", "width": 1080, "height": 1920, "file_type": "video/mp4"}]}]}
    monkeypatch.setattr(M, "http", lambda: S(data))
    a, b = M.pexels_videos("octopus", "key")
    assert (a.rank, b.rank) == (0, 1)
    assert b.text == "an octopus swimming in the sea"


def test_relevance_matches_word_forms():
    item = M.MediaItem("pexels", "1", "video", text="octopuses swimming near a coral reef")
    assert M.relevance(item, "octopus swims") == 1.0
    assert M.relevance(item, "octopus city") == 0.5
    assert M.relevance(M.MediaItem("local", "x", "video"), "anything") == 0.5  # no description: neutral


def test_claim_prefers_the_clip_that_shows_the_scene(monkeypatch):
    monkeypatch.setattr(M.random, "uniform", lambda a, b: 0.0)
    v = M.Visuals(Settings())
    # The search engine ranked an unrelated clip first; the matching one should still win.
    off = M.MediaItem("pexels", "1", "video", width=1080, height=1920, duration=10, rank=0,
                      text="woman walking in a park")
    on = M.MediaItem("pexels", "2", "video", width=1080, height=1920, duration=10, rank=3,
                     text="octopus camouflage on coral reef")
    assert v._claim([off, on], 5, "octopus camouflage").key == "pexels:2"
    # With equal descriptions the search ranking decides.
    first = M.MediaItem("pexels", "3", "video", width=1080, height=1920, duration=10, rank=0, text="ocean waves")
    later = M.MediaItem("pexels", "4", "video", width=1080, height=1920, duration=10, rank=9, text="ocean waves")
    assert v._claim([later, first], 5, "ocean waves").key == "pexels:3"


def test_pixabay_video_tags_are_preserved(monkeypatch):
    data = {"hits": [{
        "id": 42, "duration": 10, "user": "test",
        "tags": "octopus, camouflage, underwater",
        "videos": {
            "medium": {"url": "video-url", "width": 1920, "height": 1080}
        },
    }]}
    monkeypatch.setattr(M, "http", lambda: S(data))
    item = M.pixabay_videos("octopus camouflage", "key")[0]
    assert item.extra["tags"] == "octopus, camouflage, underwater"


def test_claim_prioritizes_relevance_over_video_quality():
    specific = M.MediaItem(
        "pixabay", "specific", "video", width=640, height=360, duration=1,
        extra={"tags": "octopus, changing color, camouflage"},
    )
    generic = M.MediaItem(
        "pixabay", "generic", "video", width=2160, height=3840, duration=60,
        extra={"tags": "octopus, color, underwater, marine life"},
    )
    v = M.Visuals(Settings(visual_sources=["pixabay"]))
    selected = v._claim([generic, specific], 5, query="octopus changing color")
    assert selected is not None
    assert selected.key == "pixabay:specific"


def test_claim_rejects_misleading_octopus_carousel():
    carousel = M.MediaItem(
        "pixabay", "carousel", "video", width=3840, height=2160, duration=60,
        extra={"tags": "octopus, fair, folk festival, carousel, ride, fairground"},
    )
    v = M.Visuals(Settings(visual_sources=["pixabay"]))
    assert v._claim([carousel], 5, query="octopus") is None


def test_claim_rejects_pixabay_results_without_subject_match():
    lights = M.MediaItem(
        "pixabay", "lights", "video", width=3840, height=2160, duration=60,
        extra={"tags": "abstract, lights, background, color change, illuminated"},
    )
    v = M.Visuals(Settings(visual_sources=["pixabay"]))
    assert v._claim([lights], 5, query="octopus changing color") is None


# ------------------------------------------------------------------ Pexels photo relevance (extends the
# same tag-based filtering Pixabay already had to the newly-captured `alt` text on Pexels photos)
def test_pexels_photos_capture_alt_text_as_tags(monkeypatch):
    data = {"photos": [{"id": 9, "width": 1920, "height": 1080, "photographer": "Ann",
                        "alt": "A red octopus camouflaged on a coral reef",
                        "src": {"original": "https://example/photo.jpg"}}]}
    monkeypatch.setattr(M, "http", lambda: S(data))
    item = M.pexels_photos("octopus", "key")[0]
    assert item.extra["tags"] == "A red octopus camouflaged on a coral reef"


def test_claim_rejects_irrelevant_pexels_photo():
    unrelated = M.MediaItem(
        "pexels-photo", "1", "image", width=1920, height=1080,
        extra={"tags": "sunset over a mountain lake"},
    )
    v = M.Visuals(Settings(visual_sources=["pexels-photos"]))
    assert v._claim([unrelated], 5, query="octopus underwater") is None


def test_claim_accepts_relevant_pexels_photo_over_irrelevant_one():
    relevant = M.MediaItem(
        "pexels-photo", "2", "image", width=1920, height=1080,
        extra={"tags": "octopus camouflaged on coral reef underwater"},
    )
    unrelated = M.MediaItem(
        "pexels-photo", "1", "image", width=1920, height=1080,
        extra={"tags": "sunset over a mountain lake"},
    )
    v = M.Visuals(Settings(visual_sources=["pexels-photos"]))
    selected = v._claim([unrelated, relevant], 5, query="octopus underwater")
    assert selected is not None and selected.key == "pexels-photo:2"


def test_pexels_video_without_tags_is_still_considered_relevant():
    # Pexels videos carry no tags/description at all — there's no honest basis to reject them,
    # unlike Pixabay/Pexels-photo items which do have text to judge against.
    untagged = M.MediaItem("pexels", "1", "video", width=1920, height=1080, duration=10)
    assert M._is_relevant(untagged, "octopus underwater") is True


# ------------------------------------------------------------------ synonyms / term variations
def test_relevance_tokens_normalize_plurals_and_synonyms():
    assert M._relevance_tokens("octopuses changing colors") == M._relevance_tokens("octopus change color")


def test_is_relevant_matches_via_synonyms_not_literal_terms():
    item = M.MediaItem("pixabay", "1", "video", extra={"tags": "octopus, color change, reef"})
    # The query uses the plural/gerund forms; only normalization (not a literal string match) lets
    # this match the singular/base forms recorded in the tags.
    assert M._is_relevant(item, "octopuses changing colors") is True


def test_is_relevant_does_not_depend_on_query_word_order():
    # Two of the five query words ("octopus", "camouflage") are in the tags — enough to pass the
    # 0.4 overlap ratio. The distinctive anchor word must be found by length, not by scanning for
    # whichever word happens to be first, or moving "camouflage" to the front would flip the result.
    item = M.MediaItem("pixabay", "1", "video", extra={"tags": "octopus camouflage reef"})
    assert M._is_relevant(item, "zebra lion tiger octopus camouflage") is True
    assert M._is_relevant(item, "camouflage zebra lion tiger octopus") is True


# ------------------------------------------------------------------ fallback when nothing adequate is found
def test_for_scene_prefers_later_verified_source_over_earlier_unverified(monkeypatch, tmp_path):
    # Pexels (untagged, unverifiable) is tried first and produces a hit, but it must not win
    # outright: Pixabay (tagged) is tried next and offers a verifiably relevant match, which
    # should be preferred over the earlier unverified guess.
    untagged = M.MediaItem("pexels", "1", "video", width=1920, height=1080, duration=10)
    tagged = M.MediaItem("pixabay", "2", "video", width=1920, height=1080, duration=10,
                         extra={"tags": "octopus, reef, underwater"})

    def fake_search(self, source, query):
        return {"pexels": [untagged], "pixabay": [tagged]}.get(source, [])
    monkeypatch.setattr(M.Visuals, "_search", fake_search)
    monkeypatch.setattr(M.Visuals, "_fetch", lambda self, item, dest_dir, idx: item)
    v = M.Visuals(Settings(visual_sources=["pexels", "pixabay"]))
    item = v.for_scene(0, "octopus underwater", "octopus", "ocean", 3.0, tmp_path)
    assert item.key == "pixabay:2"


def test_for_scene_falls_back_to_unverified_when_nothing_verified_is_found(monkeypatch, tmp_path):
    # When no source ever offers a verifiably relevant match, the earlier unverified guess is
    # still used rather than giving up and generating a background.
    untagged = M.MediaItem("pexels", "1", "video", width=1920, height=1080, duration=10)
    monkeypatch.setattr(M.Visuals, "_search", lambda self, source, query: {"pexels": [untagged]}.get(source, []))
    monkeypatch.setattr(M.Visuals, "_fetch", lambda self, item, dest_dir, idx: item)
    v = M.Visuals(Settings(visual_sources=["pexels"]))
    item = v.for_scene(0, "octopus underwater", "octopus", "ocean", 3.0, tmp_path)
    assert item.key == "pexels:1"


def test_search_falls_back_to_pixabay_photos_when_videos_are_irrelevant(monkeypatch):
    class Session:
        def get(self, url, params=None, headers=None, timeout=None):
            if "videos" in url:
                return R({"hits": [{"id": 1, "duration": 5, "user": "x", "tags": "carousel, fair, festival",
                                    "videos": {"medium": {"url": "video-url", "width": 1920, "height": 1080}}}]})
            return R({"hits": [{"id": 2, "tags": "octopus, reef", "imageWidth": 1920, "imageHeight": 1080,
                                "largeImageURL": "photo-url", "user": "y"}]})
    monkeypatch.setattr(M, "http", lambda: Session())
    v = M.Visuals(Settings(visual_sources=["pixabay"], pixabay_api_key="k"))
    items = v._search("pixabay", "octopus")
    assert items and items[0].source == "pixabay-photo" and items[0].url == "photo-url"
