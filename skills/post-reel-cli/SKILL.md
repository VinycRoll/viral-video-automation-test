---
name: post-reel-cli
description: >
  Runs this repo's existing post_reel.py CLI to generate (dry-run) and publish Instagram
  Reels about personal finance. Use when a squad step needs to generate a Reel video without
  posting it, or to post a video that was already generated and approved. Never reimplement
  script generation (Gemini), narration (XTTS v2), or publishing (Publora/Make.com) logic —
  post_reel.py already does all of that.
type: script
version: "1.0.0"
script:
  path: ../../post_reel.py
  runtime: python
  invoke: "python3 {skill_path}/../../post_reel.py {args}"
categories: [automation, video, social-media]
---

# post_reel.py CLI Skill

## When to use

Use this skill any time a squad step needs to generate or publish a personal-finance
Instagram Reel through the repo's existing `post_reel.py` pipeline (Gemini script →
XTTS v2 narration → Pixabay/ComfyUI background → Remotion render → Publora/Make.com
publishing). This skill never duplicates that logic — it only documents how to invoke it.

## Instructions

### Generate a video without posting (dry-run)

```
python3 post_reel.py --dry-run "{tema}"
```

- `{tema}` is optional free text (e.g. `"3 erros no cartão de crédito"`). Omit it to let
  post_reel.py pick a random theme.
- On success, stdout prints a line `Vídeo salvo em: {path}` — the generated `.mp4` lives
  under `videos_gerados/` at the repo root (or wherever `VIDEOS_DIR` points).
- The caption that post_reel.py would use is also printed and should be captured for the
  approval checkpoint.
- The actual script/narration text Gemini generated is saved to
  `remotion-template/ultimo_roteiro.json` — read it when a reviewer needs to evaluate wording,
  not just the video file.

### Post a video that was already approved

```
python3 post_reel.py --video "{caminho-absoluto-do-mp4}"
```

- Only run this AFTER the squad's human-approval checkpoint has confirmed the video.
- `{tema}` can optionally be passed as the first positional arg to control the caption theme;
  otherwise post_reel.py reuses/derives one.
- On success, stdout confirms `Reel postado com sucesso no Instagram!`. On failure, it exits
  non-zero and prints where the video file remains so it is never lost.

## Available operations

- **Dry-run generation** — produce the video file + caption without any irreversible action.
- **Post** — publish an already-generated, already-approved video file.

## Error handling

- Missing `.env` keys (Gemini/Pixabay/Publora) → post_reel.py prints exactly which keys are
  missing and exits non-zero; surface that message to the user, don't guess at defaults.
- `--video` with a path that doesn't exist → post_reel.py exits non-zero immediately; verify
  the path exists before invoking.
