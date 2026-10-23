#!/usr/bin/env python3
"""
gerar_motion.py — Gera roteiro JSON via Gemini, narração via XTTS v2,
imagens de fundo via Pixabay (ou ComfyUI com --ai-image) e renderiza com Remotion.

Uso:
    python3 gerar_motion.py                    # tema aleatório, fundo com imagens do Pixabay
    python3 gerar_motion.py "juros compostos"  # tema específico
    python3 gerar_motion.py --dry-run          # só gera JSON + áudios, não renderiza
    python3 gerar_motion.py --ai-image         # imagens de fundo geradas por IA (ComfyUI);
                                                # cai para o Pixabay se o ComfyUI falhar/indisponível
"""

import os
import sys
import json
import copy
import shutil
import itertools
import subprocess
import datetime
import random
import time
import uuid
import pathlib
from pathlib import Path

try:
    import requests
    from dotenv import load_dotenv
    import soundfile as sf
    from TTS.api import TTS
except ImportError:
    # O pacote "TTS" original (Coqui AI) não publica build para Python >=3.12 —
    # descontinuado desde o fechamento da empresa. Use o fork mantido "coqui-tts",
    # que preserva o mesmo namespace de import (TTS.api.TTS) usado abaixo.
    print("❌ Instale: pip install requests python-dotenv coqui-tts soundfile --break-system-packages")
    sys.exit(1)

# ── Config ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / ".env")
load_dotenv(SCRIPT_DIR.parent / "viral-video-automation" / ".env", override=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CHANNEL_NAME   = os.getenv("CHANNEL_NAME", "VinyBruno.ia")
ACCENT_COLOR   = os.getenv("ACCENT_COLOR", "#FFD700")
GEMINI_MODEL   = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")

# XTTS v2 (Coqui TTS) — roda localmente, sem API key.
XTTS_MODEL       = os.getenv("XTTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")
XTTS_LANGUAGE    = os.getenv("XTTS_LANGUAGE", "pt")
# Speaker embutido no modelo (não precisa de áudio de referência). Troque por
# outro nome de tts.speakers, ou defina XTTS_SPEAKER_WAV (.wav de 6-10s) para
# clonar uma voz específica em vez de usar um dos speakers pré-treinados.
XTTS_SPEAKER     = os.getenv("XTTS_SPEAKER", "Ana Florence")
XTTS_SPEAKER_WAV = os.getenv("XTTS_SPEAKER_WAV", "")
# XTTS v2 é distribuído sob a Coqui Public Model License (CPML - coqui.ai/cpml),
# que tem restrições para uso comercial. Ao baixar o modelo pela 1a vez, a lib
# pede confirmação interativa dos termos — isso trava um pipeline automatizado
# sem stdin, então aceitamos aqui. Revise a licença antes de usar em conteúdo
# monetizado.
os.environ.setdefault("COQUI_TOS_AGREED", "1")

# ComfyUI (SD 1.5 local) — fallback automático para Pixabay se não estiver rodando
COMFYUI_DIR        = SCRIPT_DIR.parent / "ComfyUI"
COMFYUI_URL        = os.getenv("COMFYUI_URL", "http://localhost:8188")
COMFYUI_CHECKPOINT = os.getenv("COMFYUI_CHECKPOINT", "v1-5-pruned-emaonly-fp16.safetensors")
COMFYUI_WIDTH      = int(os.getenv("COMFYUI_WIDTH", "512"))
COMFYUI_HEIGHT     = int(os.getenv("COMFYUI_HEIGHT", "768"))
COMFYUI_STEPS      = int(os.getenv("COMFYUI_STEPS", "20"))
COMFYUI_AUTOSTART_TIMEOUT = int(os.getenv("COMFYUI_AUTOSTART_TIMEOUT", "120"))
PIXABAY_KEY        = os.getenv("PIXABAY_API_KEY", "")

# Endpoint OpenAI-compatible do Gemini (igual ao purffle-shorts — mais estável)
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

TEMAS_FINANCAS = [
    "juros compostos e como multiplicar dinheiro",
    "como sair das dívidas em 6 meses",
    "o que é tesouro direto e como investir",
    "5 erros financeiros que todo iniciante comete",
    "como montar uma reserva de emergência",
    "renda passiva: o que é e como criar",
    "como funciona a inflação e como se proteger",
    "cartão de crédito: vilão ou aliado?",
    "como investir com R$ 50 por mês",
    "o que é FGTS e quando vale sacar",
]

# ── Prompt ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Você é um criador de conteúdo viral de finanças pessoais para Instagram Reels.
Crie um roteiro de vídeo curto (20-35 segundos) em formato JSON.

REGRAS VISUAIS:
- Use *texto* para destacar em amarelo e **texto** para branco bold
- Tipos de cena: intro, text, highlight, card, list, outro
- Máximo 7 cenas, sempre inclua intro e outro
- Textos visuais em MAIÚSCULAS

REGRAS DE NARRAÇÃO:
- Cada cena tem um campo "narration" com o texto falado em português natural
- A narração deve ser fluida, como se estivesse conversando
- NÃO use maiúsculas na narração, ela é falada não lida
- A duração da cena deve ser compatível com o tempo de fala (~3 palavras/segundo)
- Cenas "intro" e "outro" podem ter narração curta ou vazia ("")

REGRAS DE IMAGENS (para geração via IA — Stable Diffusion):
- Gere também um campo "imagePrompts": lista com 5 a 8 descrições visuais em INGLÊS
- Cada prompt deve ilustrar o tema do roteiro (ex: pessoas economizando, gráficos subindo, cofrinho, carteira, calculadora, planejamento financeiro)
- NÃO inclua texto, palavras, números ou letras nos prompts (Stable Diffusion não renderiza texto bem)
- Estilo sugerido ao final de cada prompt: "cinematic photography, warm natural lighting, shallow depth of field, realistic, instagram aesthetic, vertical composition"

FORMATO JSON (retorne APENAS o JSON, sem markdown):
{
  "title": "título do vídeo",
  "accentColor": "#FFD700",
  "caption": "legenda completa para o Instagram com emojis e hashtags",
  "imagePrompts": [
    "a person organizing coins and banknotes on a wooden table, cinematic photography, warm natural lighting, shallow depth of field, realistic, instagram aesthetic, vertical composition",
    "a small piggy bank next to a growing plant, cinematic photography, warm natural lighting, shallow depth of field, realistic, instagram aesthetic, vertical composition"
  ],
  "scenes": [
    {
      "type": "intro",
      "duration": 3,
      "channel": "VinyBruno.ia",
      "title": "TÍTULO IMPACTANTE",
      "subtitle": "subtítulo explicativo",
      "narration": "você sabia que existe um jeito simples de multiplicar seu dinheiro?"
    },
    {
      "type": "highlight",
      "duration": 4,
      "text": "pergunta ou afirmação *destacada*",
      "narration": "a maioria das pessoas não sabe disso, mas faz toda a diferença."
    },
    {
      "type": "card",
      "duration": 5,
      "cardTitle": "SITUAÇÃO",
      "cardValue": "RESULTADO",
      "cardNote": "contexto em *amarelo*",
      "narration": "olha esse exemplo: cem reais por mês, durante dez anos, viram quase trinta e cinco mil reais."
    },
    {
      "type": "text",
      "duration": 3,
      "text": "texto animado com *destaque*",
      "narration": "o segredo é o tempo trabalhando a seu favor."
    },
    {
      "type": "list",
      "duration": 6,
      "items": ["💰 item 1", "📈 item *2*", "⏳ item 3"],
      "narration": "pra começar hoje, você precisa de três coisas: consistência, paciência e começar cedo."
    },
    {
      "type": "outro",
      "duration": 3,
      "channel": "VinyBruno.ia",
      "title": "CURTIU? SEGUE AÍ!",
      "cta": "▶ Seguir",
      "narration": "gostou? me segue para mais dicas de finanças todo dia."
    }
  ]
}"""

# ── Gemini (endpoint OpenAI-compatible) ──────────────────────────────────────
def gerar_roteiro(tema: str) -> dict:
    print(f"\n🤖 Gerando roteiro via Gemini ({GEMINI_MODEL}): '{tema}'...")

    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY não encontrada no .env")
        sys.exit(1)

    payload = {
        "model": GEMINI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": f"Crie um roteiro sobre: {tema}"},
        ],
        "temperature": 0.85,
        "max_tokens": 2000,
    }

    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }

    # Retry automático em 503 e timeout
    r = None
    for tentativa in range(1, 4):
        try:
            r = requests.post(GEMINI_URL, headers=headers, json=payload, timeout=90)
        except requests.exceptions.Timeout:
            espera = tentativa * 10
            print(f"   ⏳ Timeout ({tentativa}/3), tentando novamente em {espera}s...")
            time.sleep(espera)
            continue
        if r.status_code == 503:
            espera = tentativa * 10
            print(f"   ⏳ Servidor ocupado ({tentativa}/3), tentando novamente em {espera}s...")
            time.sleep(espera)
            continue
        break
    if r is None:
        print("❌ Gemini API: sem resposta após 3 tentativas")
        sys.exit(1)

    if not r.ok:
        print(f"❌ Gemini API erro {r.status_code}: {r.text[:400]}")
        r.raise_for_status()

    raw = r.json()["choices"][0]["message"]["content"].strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    script = json.loads(raw)
    script["accentColor"] = ACCENT_COLOR

    for scene in script.get("scenes", []):
        if scene.get("type") in ("intro", "outro") and not scene.get("channel"):
            scene["channel"] = CHANNEL_NAME

    print(f"✅ Roteiro: {len(script['scenes'])} cenas")
    return script


def _prompts_fallback(script: dict, tema: str, n: int = 6) -> list:
    """Monta prompts de imagem simples a partir do tema/roteiro quando o Gemini não retorna imagePrompts."""
    base = [tema]
    for scene in script.get("scenes", []):
        label = scene.get("title") or scene.get("text") or scene.get("cardTitle") or ""
        if label:
            base.append(label.lower())
    if len(base) < n:
        base = (base * ((n // len(base)) + 1))
    return base[:n]


# ── XTTS v2 (Coqui TTS) ───────────────────────────────────────────────────────
_xtts_model = None


def _xtts_device() -> str:
    try:
        import torch
        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        return "cpu"


def _get_xtts_model() -> "TTS":
    global _xtts_model
    if _xtts_model is None:
        print(f"   Carregando modelo XTTS v2 ({XTTS_MODEL})...")
        _xtts_model = TTS(XTTS_MODEL).to(_xtts_device())
    return _xtts_model


def _palavras_fallback(texto: str, offset: float, duracao: float) -> list:
    """Estima o timing de cada palavra dividindo a duração proporcionalmente
    pelo nº de caracteres — usado porque o XTTS v2 (diferente do Kokoro) não
    expõe um duration predictor (pred_dur) com timing real por fonema."""
    palavras = texto.split()
    if not palavras:
        return []
    total_chars = sum(len(w) for w in palavras) or 1
    t = offset
    out = []
    for w in palavras:
        d = duracao * (len(w) / total_chars)
        out.append({"text": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def _gerar_audio_xtts(texto: str, caminho: Path) -> list:
    model = _get_xtts_model()
    kwargs = {"text": texto, "language": XTTS_LANGUAGE, "file_path": str(caminho)}
    if XTTS_SPEAKER_WAV:
        kwargs["speaker_wav"] = XTTS_SPEAKER_WAV
    else:
        kwargs["speaker"] = XTTS_SPEAKER
    model.tts_to_file(**kwargs)

    # Timing por palavra estimado pela duração real do áudio gerado (sem
    # pred_dur como no Kokoro) — proporcional ao nº de caracteres de cada palavra.
    try:
        info = sf.info(str(caminho))
        duracao = info.frames / info.samplerate
    except Exception:
        duracao = len(texto.split()) / 3  # ~3 palavras/s, só como último recurso
    return _palavras_fallback(texto, 0.0, duracao)


def gerar_audios(script: dict, audio_dir: Path) -> dict:
    """Gera um .wav por cena (XTTS v2) e salva o caminho absoluto em scene['_audio_path'].

    IMPORTANTE: NÃO define scene['audio'] — esse campo é lido pelo Remotion
    como URL (http://localhost:3000/...) e causaria erros 404 no bundle.
    O mix com ffmpeg usa '_audio_path' diretamente após o render mudo.
    """
    audio_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n🎙️  Gerando narração com XTTS v2 (speaker='{XTTS_SPEAKER}', language='{XTTS_LANGUAGE}')...")

    for i, scene in enumerate(script["scenes"]):
        narration = scene.pop("narration", "").strip()
        if not narration:
            continue

        audio_path = audio_dir / f"cena_{i:02d}.wav"
        print(f"   [{i+1}] {scene['type']:10} → {narration[:50]}{'...' if len(narration) > 50 else ''}")

        palavras = _gerar_audio_xtts(narration, audio_path)

        # Mede duração real do áudio gerado
        try:
            r = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
                capture_output=True, text=True, timeout=10,
            )
            real_dur = float(r.stdout.strip())
        except Exception:
            real_dur = scene.get("duration", 3)

        # Campos privados (não vão pro Remotion diretamente)
        scene["_audio_path"]     = str(audio_path)
        scene["_audio_duration"] = real_dur   # duração real em segundos
        # Guarda texto, duração real e timing por palavra (efeito karaokê) para a legenda
        scene["_caption"]        = narration
        scene["_words"]          = palavras

    print("✅ Áudios gerados")
    return script


# ── ComfyUI (SD 1.5) + fallback Pixabay ──────────────────────────────────────
def _comfyui_disponivel() -> bool:
    try:
        r = requests.get(f"{COMFYUI_URL}/system_stats", timeout=3)
        return r.ok
    except Exception:
        return False


def _iniciar_comfyui() -> "subprocess.Popen | None":
    """Sobe o ComfyUI em background se ainda não estiver rodando em COMFYUI_URL.
    Retorna o processo (para ser encerrado depois) ou None se já estava rodando
    (não é nosso para derrubar) ou se não deu para subir — nesses casos o fluxo
    segue e cai no fallback Pixabay."""
    if _comfyui_disponivel():
        print(f"\n🖼️  ComfyUI já está rodando em {COMFYUI_URL}")
        return None

    main_py = COMFYUI_DIR / "main.py"
    if not main_py.exists():
        print(f"\n🖼️  ComfyUI não encontrado em {COMFYUI_DIR} — usando Pixabay")
        return None

    print(f"\n🚀 Iniciando ComfyUI em background ({COMFYUI_DIR})...")
    proc = subprocess.Popen(
        [sys.executable, "main.py", "--lowvram"],
        cwd=str(COMFYUI_DIR),
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    deadline = time.time() + COMFYUI_AUTOSTART_TIMEOUT
    while time.time() < deadline:
        if _comfyui_disponivel():
            print("   ✅ ComfyUI pronto")
            return proc
        if proc.poll() is not None:
            print("   ❌ ComfyUI encerrou antes de ficar pronto — usando Pixabay")
            return None
        time.sleep(2)

    print(f"   ⚠️  ComfyUI não respondeu em {COMFYUI_AUTOSTART_TIMEOUT}s — usando Pixabay e encerrando-o")
    proc.terminate()
    return None


def _parar_comfyui(proc: "subprocess.Popen | None") -> None:
    """Encerra o ComfyUI, mas só se fomos nós que subimos o processo."""
    if proc is None or proc.poll() is not None:
        return
    print("\n🛑 Encerrando ComfyUI...")
    proc.terminate()
    try:
        proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        proc.kill()


def _comfyui_workflow(prompt: str, seed: int) -> dict:
    negativo = ("texto, palavras, letras, números, marca d'água, baixa qualidade, "
                "deformado, borrado, membros extras, mal desenhado, assinatura")
    return {
        "3": {"class_type": "KSampler", "inputs": {
            "seed": seed, "steps": COMFYUI_STEPS, "cfg": 7.0,
            "sampler_name": "euler", "scheduler": "normal", "denoise": 1.0,
            "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0],
        }},
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": COMFYUI_CHECKPOINT}},
        "5": {"class_type": "EmptyLatentImage", "inputs": {
            "width": COMFYUI_WIDTH, "height": COMFYUI_HEIGHT, "batch_size": 1,
        }},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["4", 1]}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"text": negativo, "clip": ["4", 1]}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
        "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "reel", "images": ["8", 0]}},
    }


def _comfyui_gerar_uma(prompt: str, dest: Path, client_id: str) -> bool:
    seed = random.randint(0, 2**32 - 1)
    workflow = _comfyui_workflow(prompt, seed)

    try:
        r = requests.post(
            f"{COMFYUI_URL}/prompt",
            json={"prompt": workflow, "client_id": client_id},
            timeout=15,
        )
        if not r.ok:
            print(f"      ❌ ComfyUI /prompt erro {r.status_code}: {r.text[:200]}")
            return False
        prompt_id = r.json().get("prompt_id")
        if not prompt_id:
            return False
    except Exception as e:
        print(f"      ❌ Erro ao enviar prompt ao ComfyUI: {e}")
        return False

    # Poll em /history até a imagem ficar pronta (timeout ~90s)
    for _ in range(90):
        time.sleep(1)
        try:
            h = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=10)
        except Exception:
            continue
        if not h.ok:
            continue
        data = h.json().get(prompt_id)
        if not data:
            continue
        imagens = data.get("outputs", {}).get("9", {}).get("images", [])
        if imagens:
            img = imagens[0]
            params = {
                "filename": img["filename"],
                "subfolder": img.get("subfolder", ""),
                "type": img.get("type", "output"),
            }
            img_r = requests.get(f"{COMFYUI_URL}/view", params=params, timeout=30)
            if img_r.ok:
                dest.write_bytes(img_r.content)
                return True
            return False

    print("      ❌ Timeout esperando o ComfyUI gerar a imagem")
    return False


def _pixabay_fallback(prompts: list, tema: str, dest_dir: Path) -> list:
    print("   ↪️  ComfyUI indisponível — usando Pixabay como fallback de imagens")
    if not PIXABAY_KEY:
        print("   ❌ PIXABAY_API_KEY não configurada — sem fallback de imagens")
        return []

    caminhos = []
    vistos = set()
    termos = prompts if prompts else [tema]

    for i, termo in enumerate(termos):
        query = termo.split(",")[0][:100] or tema
        try:
            r = requests.get("https://pixabay.com/api/", params={
                "key": PIXABAY_KEY, "q": query, "image_type": "photo",
                "orientation": "vertical", "safesearch": "true", "per_page": 20,
            }, timeout=15)
            hits = r.json().get("hits", []) if r.ok else []
        except Exception:
            hits = []

        hit = next((h for h in hits if h["id"] not in vistos), hits[0] if hits else None)
        if not hit:
            continue
        vistos.add(hit["id"])

        try:
            img_r = requests.get(hit["largeImageURL"], timeout=30)
        except Exception:
            continue
        if img_r.ok:
            caminho = dest_dir / f"img_{i:02d}.jpg"
            caminho.write_bytes(img_r.content)
            caminhos.append(caminho)

    return caminhos


def gerar_imagens(prompts: list, tema: str, dest_dir: Path, usar_ia: bool = False) -> list:
    """Gera imagens de fundo. Sem --ai-image (usar_ia=False): busca direto no Pixabay (padrão).
    Com --ai-image: tenta ComfyUI (SD 1.5 local) primeiro e cai para o Pixabay se indisponível/falhar."""
    dest_dir.mkdir(parents=True, exist_ok=True)

    if not usar_ia:
        return _pixabay_fallback(prompts, tema, dest_dir)

    if not _comfyui_disponivel():
        print(f"\n🖼️  ComfyUI não detectado em {COMFYUI_URL}")
        return _pixabay_fallback(prompts, tema, dest_dir)

    print(f"\n🖼️  Gerando {len(prompts)} imagens via ComfyUI (SD 1.5, {COMFYUI_WIDTH}x{COMFYUI_HEIGHT})...")
    client_id = str(uuid.uuid4())
    caminhos = []
    for i, prompt in enumerate(prompts):
        dest = dest_dir / f"img_{i:02d}.png"
        print(f"   [{i+1}/{len(prompts)}] {prompt[:60]}{'...' if len(prompt) > 60 else ''}")
        if _comfyui_gerar_uma(prompt, dest, client_id):
            caminhos.append(dest)
        else:
            print(f"      ⚠️  Falhou — pulando imagem {i+1}")

    if not caminhos:
        print("   ⚠️  Nenhuma imagem gerada pelo ComfyUI — tentando Pixabay")
        return _pixabay_fallback(prompts, tema, dest_dir)

    return caminhos


def aplicar_imagens_de_fundo(script: dict, imagens: list) -> None:
    """Copia as imagens geradas para public/images/ e associa uma a cada cena
    (cicla se houver menos imagens que cenas) para o Ken Burns no Remotion."""
    public_images_dir = SCRIPT_DIR / "public" / "images"
    if public_images_dir.exists():
        shutil.rmtree(public_images_dir)
    public_images_dir.mkdir(parents=True, exist_ok=True)

    nomes = []
    for i, origem in enumerate(imagens):
        destino = public_images_dir / f"{i:02d}{origem.suffix}"
        shutil.copy(origem, destino)
        nomes.append(destino.name)

    print(f"\n🎞️  {len(nomes)} imagem(ns) pronta(s) em public/images/ (Ken Burns automático)")
    ciclo = itertools.cycle(nomes)
    for scene in script["scenes"]:
        scene["backgroundImage"] = f"images/{next(ciclo)}"


# ── ffmpeg mix ───────────────────────────────────────────────────────────────
def mixar_audio(script: dict, video_sem_audio: Path, output_path: Path) -> bool:
    """Combina o vídeo mudo com os áudios de cada cena usando ffmpeg."""
    if not shutil.which("ffmpeg"):
        print("⚠️  ffmpeg não encontrado — copiando vídeo sem áudio")
        shutil.copy(video_sem_audio, output_path)
        return True

    def audio_duration(path: str) -> float:
        """Retorna duração real do áudio em segundos via ffprobe."""
        try:
            r = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", path],
                capture_output=True, text=True, timeout=10,
            )
            return float(r.stdout.strip())
        except Exception:
            return 0.0

    # Calcula timestamp de início de cada cena usando duração real do áudio
    # para evitar sobreposição quando a fala é mais longa que a cena visual
    inputs, filters, maps = [], [], []
    t = 0.0
    audio_idx = 0
    for scene in script["scenes"]:
        audio_path = scene.get("_audio_path")
        scene_dur = scene.get("duration", 3)
        if audio_path and pathlib.Path(audio_path).exists():
            real_dur = audio_duration(audio_path)
            inputs += ["-i", audio_path]
            filters.append(
                f"[{audio_idx + 1}:a]adelay={int(t * 1000)}|{int(t * 1000)}[a{audio_idx}]"
            )
            maps.append(f"[a{audio_idx}]")
            audio_idx += 1
            # Avança pelo tempo real do áudio (nunca menor que a duração da cena)
            t += max(scene_dur, real_dur)
        else:
            t += scene_dur

    if not maps:
        print("⚠️  Nenhum áudio encontrado — copiando vídeo sem áudio")
        shutil.copy(video_sem_audio, output_path)
        return True

    # Mixar todos os áudios e combinar com vídeo
    # O vídeo mudo já tem a duração correta (ajustada via scene.duration no main)
    amix = f"{''.join(maps)}amix=inputs={len(maps)}:normalize=0[aout]"
    filter_complex = ";".join(filters) + ";" + amix
    cmd = (
        ["ffmpeg", "-y", "-i", str(video_sem_audio)]
        + inputs
        + [
            "-filter_complex", filter_complex,
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            str(output_path),
        ]
    )
    print(f"\n🔊 Mixando {len(maps)} faixa(s) de áudio com ffmpeg...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ ffmpeg erro:\n{result.stderr[-500:]}")
        return False
    print(f"✅ Áudio mixado: {output_path}")
    return True

# ── Remotion render ───────────────────────────────────────────────────────────
def renderizar(script: dict, output_path: Path, total_frames: int = 0) -> bool:
    """Renderiza com Remotion. O script passado NÃO deve ter 'audio' nem '_audio_path'."""
    props_file = SCRIPT_DIR / "input-props.json"
    props_file.write_text(json.dumps({"script": script}, ensure_ascii=False))

    print(f"\n🎬 Renderizando com Remotion (vídeo mudo)...")
    print(f"   Saída: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "npx", "remotion", "render",
        "src/index.ts",
        "MotionReel",
        str(output_path),
        "--props", str(props_file),
    ]
    if total_frames > 0:
        cmd += ["--frames", f"0-{total_frames - 1}"]

    try:
        result = subprocess.run(
            cmd,
            cwd=SCRIPT_DIR,
            timeout=300,
        )
        props_file.unlink(missing_ok=True)

        if result.returncode == 0:
            print(f"\n✅ Vídeo mudo: {output_path}")
            return True
        else:
            print(f"\n❌ Remotion falhou (código {result.returncode})")
            return False
    except Exception as e:
        props_file.unlink(missing_ok=True)
        print(f"\n❌ Erro: {e}")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run  = "--dry-run" in sys.argv
    ai_image = "--ai-image" in sys.argv

    tema = " ".join(args) if args else random.choice(TEMAS_FINANCAS)

    # 1. Roteiro
    script = gerar_roteiro(tema)

    image_prompts = script.pop("imagePrompts", None) or []
    if not image_prompts:
        image_prompts = _prompts_fallback(script, tema)
    image_prompts = image_prompts[:8]
    if len(image_prompts) < 5:
        image_prompts = (image_prompts * 5)[:5]

    print("\n📋 Cenas:")
    for i, scene in enumerate(script["scenes"]):
        label = (
            scene.get("title")
            or scene.get("text")
            or scene.get("cardTitle")
            or (scene.get("items") or [""])[0]
            or ""
        )
        print(f"   [{i+1}] {scene['type']:10} {scene['duration']}s | {label[:45]}")

    # 2. Áudios (salvos em output_dir/audios/, caminho em scene['_audio_path'])
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = SCRIPT_DIR.parent / "videos_gerados" / f"motion_{ts}"
    audio_dir  = output_dir / "audios"

    script = gerar_audios(script, audio_dir)

    # 2b. Imagens de fundo com Ken Burns (Pixabay por padrão; --ai-image sobe o ComfyUI
    # automaticamente, usa, e derruba de novo ao final — só se fomos nós que subimos)
    comfyui_proc = _iniciar_comfyui() if ai_image else None
    try:
        imagens = gerar_imagens(image_prompts, tema, output_dir / "images", usar_ia=ai_image)
        if imagens:
            aplicar_imagens_de_fundo(script, imagens)
        else:
            print("⚠️  Nenhuma imagem disponível (Pixabay/ComfyUI falharam) — usando fundo padrão")

        # Salva JSON para inspeção (inclui _audio_path para debug)
        json_out = SCRIPT_DIR / "ultimo_roteiro.json"
        json_out.write_text(json.dumps(script, ensure_ascii=False, indent=2))
        print(f"\n💾 JSON: {json_out}")

        if dry_run:
            print("\n⏭️  --dry-run: pulando renderização")
            print(f"   Áudios em: {audio_dir}")
            return
    finally:
        _parar_comfyui(comfyui_proc)

    # 3. Monta script limpo para o Remotion:
    #    - remove _audio_path (campo privado Python)
    #    - remove audio (se Gemini gerou, causaria 404 no bundle)
    #    - promove _caption → caption para exibir como legenda na tela
    #    - ajusta scene.duration para max(visual, audio) p/ Remotion renderizar frames suficientes
    #    - backgroundImage (se houver) passa direto para o Remotion aplicar o Ken Burns
    fps = 30
    script_remotion = copy.deepcopy(script)
    for scene in script_remotion["scenes"]:
        scene.pop("audio", None)
        audio_dur = scene.pop("_audio_duration", None)
        if "_caption" in scene:
            scene["caption"] = scene.pop("_caption")
            if audio_dur is not None:
                # Garante que a cena dure pelo menos o tempo do áudio
                scene["duration"] = max(scene["duration"], audio_dur)
                scene["captionFrames"] = int(audio_dur * fps)
            else:
                scene["captionFrames"] = int(scene["duration"] * fps)
        if "_words" in scene:
            # Timing por palavra (estimado proporcionalmente, XTTS não tem pred_dur) p/ karaokê
            scene["words"] = scene.pop("_words")
        scene.pop("_audio_path", None)

    # Duração total real em frames para o Remotion
    total_frames = sum(int(s["duration"] * fps) for s in script_remotion["scenes"])

    # 4. Renderiza vídeo mudo
    video_mudo  = output_dir / "reel_mudo.mp4"
    output_path = output_dir / "reel.mp4"

    ok = renderizar(script_remotion, video_mudo, total_frames)

    if ok:
        # 5. Mixa áudio com ffmpeg
        ok = mixar_audio(script, video_mudo, output_path)
        video_mudo.unlink(missing_ok=True)

    if ok:
        caption = script.get("caption", "")
        if caption:
            print(f"\n📝 Legenda sugerida:\n{caption}")
        print(f"\n🎥 Para postar: reel --video '{output_path}'")

if __name__ == "__main__":
    main()
