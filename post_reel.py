#!/usr/bin/env python3
"""
post_reel.py — Pipeline automático de Instagram Reels sobre finanças pessoais.

Fluxo:
  1. Escolhe um tema viral de finanças
  2. Gera o vídeo (Remotion + XTTS v2 + imagens de fundo via Pixabay, por padrão)
  3. Tenta postar via Publora (limite: 15 posts/mês)
  4. Fallback automático: upload Catbox.moe → Make.com → Instagram

Uso:
  python3 post_reel.py                          # tema aleatório (Remotion + XTTS v2 + Pixabay)
  python3 post_reel.py 'renda extra'            # tema específico
  python3 post_reel.py --ai-image               # fundo com imagens de IA (ComfyUI, fallback Pixabay)
  python3 post_reel.py --purffle                # usa o pipeline legado purffle-shorts + edge-tts
  python3 post_reel.py --dry-run                # só gera o vídeo, não posta
  python3 post_reel.py --video caminho.mp4      # posta um vídeo já gerado
  python3 post_reel.py --make --video ...       # força Make.com (ignora Publora)
"""

import argparse
import json
import os
import random
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Libs Google / YouTube (opcionais) ─────────────────────────────────────────
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request as GoogleRequest
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    YOUTUBE_DISPONIVEL = True
except ImportError:
    YOUTUBE_DISPONIVEL = False

# ── Caminhos ──────────────────────────────────────────────────────────────────
SCRIPT_DIR    = Path(__file__).parent
PURFFLE_DIR   = SCRIPT_DIR / "viral-video-automation"
MOTION_DIR    = SCRIPT_DIR / "remotion-template"
VIDEOS_DIR    = SCRIPT_DIR / "videos_gerados"
HISTORICO     = SCRIPT_DIR / ".historico.json"

VIDEOS_DIR.mkdir(exist_ok=True)

# ── Carregar .env dos dois projetos ───────────────────────────────────────────
load_dotenv(SCRIPT_DIR / ".env")
load_dotenv(PURFFLE_DIR / ".env", override=False)

PUBLORA_KEY         = os.getenv("PUBLORA_API_KEY", "")
INSTAGRAM_PLATFORM  = os.getenv("INSTAGRAM_PLATFORM_ID", "")
PIXABAY_KEY         = os.getenv("PIXABAY_API_KEY", "")
GEMINI_KEY          = os.getenv("GEMINI_API_KEY", "")
MAKE_WEBHOOK        = os.getenv("MAKE_WEBHOOK_URL", "")
YOUTUBE_MAKE_WEBHOOK  = os.getenv("YOUTUBE_MAKE_WEBHOOK_URL", "")
YOUTUBE_SCOPES        = ["https://www.googleapis.com/auth/youtube.upload"]
YOUTUBE_CLIENT_SECRET = SCRIPT_DIR / "client_secret.json"
YOUTUBE_TOKEN_FILE    = SCRIPT_DIR / ".youtube_token.json"

PUBLORA_BASE = "https://api.publora.com/api/v1"

# ── Temas virais de finanças ───────────────────────────────────────────────────
TEMAS = [
    "como sair das dívidas em 6 meses",
    "regra 50-30-20 para organizar dinheiro",
    "como investir com apenas R$50 por mês",
    "por que a poupança está te fazendo perder dinheiro",
    "5 hábitos de pessoas que ficaram ricas",
    "como funciona o juros compostos na prática",
    "o que é tesouro direto e como começar",
    "3 erros financeiros que você comete todo mês",
    "como criar uma reserva de emergência do zero",
    "renda passiva: o que é e como conseguir",
    "cartão de crédito: vilão ou aliado?",
    "como negociar dívidas e sair do vermelho",
    "fundos imobiliários para iniciantes",
    "a diferença entre ativo e passivo financeiro",
    "como economizar R$500 por mês sem sofrimento",
    "investir em ações: mito ou realidade para iniciantes",
    "o que acontece com seu dinheiro na poupança",
    "CDB vs Tesouro Selic: qual é melhor?",
    "como montar um orçamento mensal que funciona",
    "independência financeira: quanto preciso guardar?",
]

HASHTAGS_BASE = (
    "#financaspessoais #dinheiro #investimentos #educacaofinanceira "
    "#independenciafinanceira #riqueza #economizar #tesouro #bolsadevalores "
    "#reels #viral"
)


def carregar_historico() -> list:
    if HISTORICO.exists():
        try:
            return json.loads(HISTORICO.read_text())
        except Exception:
            pass
    return []


def salvar_historico(historico: list, tema: str):
    historico.append({"tema": tema, "data": datetime.now().isoformat()})
    historico = historico[-30:]
    HISTORICO.write_text(json.dumps(historico, ensure_ascii=False, indent=2))


def escolher_tema(hint: str | None = None) -> str:
    historico = carregar_historico()
    usados = {h["tema"] for h in historico}

    if hint:
        return hint

    disponiveis = [t for t in TEMAS if t not in usados]
    if not disponiveis:
        print("⚠️  Todos os temas foram usados. Reiniciando ciclo.")
        disponiveis = TEMAS

    return random.choice(disponiveis)


def gerar_video_motion(tema: str, ai_image: bool = False) -> "tuple[Path | None, str]":
    """Chama gerar_motion.py para gerar o vídeo com Remotion + XTTS v2.
    Fundo: Pixabay por padrão; com ai_image=True, tenta ComfyUI primeiro (fallback Pixabay).
    Retorna (caminho_mp4, caption_instagram) ou (None, "")."""
    print(f"\n🎬 Gerando vídeo motion sobre: '{tema}'")
    print("   (Gemini → roteiro | XTTS v2 → narração | %s → fundo | Remotion → render)"
          % ("ComfyUI/Pixabay" if ai_image else "Pixabay"))

    script_py = MOTION_DIR / "gerar_motion.py"
    if not script_py.exists():
        print(f"❌ gerar_motion.py não encontrado em {MOTION_DIR}")
        return None, ""

    cmd = [sys.executable, str(script_py), tema]
    if ai_image:
        cmd.append("--ai-image")

    try:
        resultado = subprocess.run(
            cmd,
            cwd=str(MOTION_DIR),
            timeout=600,
        )

        if resultado.returncode != 0:
            print(f"❌ gerar_motion.py falhou (código {resultado.returncode})")
            return None, ""

        # O vídeo vai para videos_gerados/motion_TIMESTAMP/reel.mp4
        mp4s = sorted(
            (SCRIPT_DIR / "videos_gerados").rglob("reel.mp4"),
            key=lambda p: p.stat().st_mtime,
        )
        if not mp4s:
            print("❌ reel.mp4 não encontrado após geração")
            return None, ""

        video = mp4s[-1]
        print(f"✅ Vídeo gerado: {video} ({video.stat().st_size // 1024} KB)")

        # Tenta ler a caption do ultimo_roteiro.json gerado pelo script
        caption = ""
        roteiro_json = MOTION_DIR / "ultimo_roteiro.json"
        if roteiro_json.exists():
            try:
                roteiro = json.loads(roteiro_json.read_text())
                caption = roteiro.get("caption", "")
            except Exception:
                pass

        if not caption:
            caption = montar_caption(tema)

        return video, caption

    except subprocess.TimeoutExpired:
        print("❌ Timeout: geração demorou mais de 10 minutos")
        return None, ""
    except Exception as e:
        print(f"❌ Erro ao chamar gerar_motion.py: {e}")
        return None, ""


def gerar_video_purffle(tema: str, output_dir: Path) -> "Path | None":
    """Chama o purffle-shorts para gerar o vídeo narrado com Pixabay."""
    print(f"\n🎬 Gerando vídeo sobre: '{tema}'")
    print("   (Gemini → roteiro | edge-tts → narração | Pixabay → imagens)")

    env = os.environ.copy()
    env["PIXABAY_API_KEY"] = PIXABAY_KEY
    env["GEMINI_API_KEY"]  = GEMINI_KEY
    env["LLM_PROVIDER"]    = "gemini"
    env["LLM_MODEL"]       = "gemini-3.5-flash-lite"
    env["TTS_ENGINE"]      = "edge"
    env["LANGUAGE"]        = "pt"
    env["TARGET_SECONDS"]  = "45"
    env["SCRIPT_STYLE"]    = "facts"
    env["WATERMARK"]       = "none"
    env["VISUAL_SOURCES"]  = "pixabay,pollinations"
    env["KEEP_VIDEOS"]     = "true"
    env["SCRIPT_REVIEW"]   = "rewrite"
    env["CHANNEL_NAME"]    = "VinyBruno.ia"
    env["AUDIENCE"]        = (
        "jovens brasileiros de 20 a 35 anos que querem aprender educação financeira, "
        "sair das dívidas e investir pela primeira vez. Linguagem simples, direta e motivadora."
    )
    env["NICHES"]          = (
        "educação financeira brasileira,investimentos para iniciantes,"
        "sair das dívidas,renda extra,independência financeira"
    )

    pasta_saida = output_dir / f"purffle_{int(time.time())}"
    pasta_saida.mkdir(parents=True, exist_ok=True)
    env["OUTPUT_DIR"] = str(pasta_saida)

    env_file = PURFFLE_DIR / ".env"

    cmd = [
        sys.executable, "-m", "purffle_shorts", "make",
        "--topic", tema,
        "--no-upload",
        "--lang", "pt",
        "--visuals", "pixabay,pollinations",
        "--duration", "45",
        "--style", "facts",
        "--env-file", str(env_file),
    ]

    print(f"   Executando purffle-shorts...")

    try:
        resultado = subprocess.run(
            cmd,
            cwd=str(PURFFLE_DIR),
            env=env,
            timeout=300,
        )

        if resultado.returncode != 0:
            print(f"❌ purffle-shorts falhou (código {resultado.returncode})")
            return None

        mp4s = sorted(pasta_saida.rglob("*.mp4"), key=lambda p: p.stat().st_mtime)
        if not mp4s:
            mp4s = sorted((PURFFLE_DIR / "output_videos").rglob("*.mp4"), key=lambda p: p.stat().st_mtime)

        if mp4s:
            video = mp4s[-1]
            print(f"✅ Vídeo gerado: {video.name} ({video.stat().st_size // 1024} KB)")
            return video
        else:
            print("❌ MP4 não encontrado após geração")
            return None

    except subprocess.TimeoutExpired:
        print("❌ Timeout: geração demorou mais de 5 minutos")
        return None
    except Exception as e:
        print(f"❌ Erro ao chamar purffle-shorts: {e}")
        return None


def fazer_upload_publora(video_path: Path, caption: str) -> "str | None":
    """Fluxo: criar draft → obter upload URL → PUT do arquivo → retorna postGroupId"""
    headers = {
        "x-publora-key": PUBLORA_KEY,
        "Content-Type": "application/json",
    }

    print("\n📤 Criando rascunho no Publora...")
    r = requests.post(
        f"{PUBLORA_BASE}/create-post",
        headers=headers,
        json={"content": caption, "platforms": [INSTAGRAM_PLATFORM]},
        timeout=30,
    )

    if not r.ok:
        print(f"❌ Erro ao criar rascunho: {r.status_code} — {r.text[:300]}")
        return None

    post_data = r.json()
    post_group_id = post_data.get("postGroupId")
    if not post_group_id:
        print(f"❌ postGroupId não retornado: {post_data}")
        return None

    print(f"   Rascunho criado: {post_group_id}")

    print("📎 Obtendo URL de upload...")
    r = requests.post(
        f"{PUBLORA_BASE}/get-upload-url",
        headers=headers,
        json={
            "fileName": video_path.name,
            "contentType": "video/mp4",
            "type": "video",
            "postGroupId": post_group_id,
        },
        timeout=30,
    )

    if not r.ok:
        print(f"❌ Erro ao obter URL de upload: {r.status_code} — {r.text[:300]}")
        return None

    upload_data = r.json()
    upload_url = upload_data.get("uploadUrl")

    if not upload_url:
        print(f"❌ uploadUrl não retornado: {upload_data}")
        return None

    print(f"   Enviando arquivo ({video_path.stat().st_size // 1024} KB)...")

    with open(video_path, "rb") as f:
        r = requests.put(
            upload_url,
            data=f,
            headers={"Content-Type": "video/mp4"},
            timeout=120,
        )

    if not r.ok:
        print(f"❌ Erro no upload do arquivo: {r.status_code}")
        return None

    print(f"✅ Upload concluído!")
    return post_group_id


def publicar_agora(post_group_id: str) -> bool:
    """Agenda o post para publicação imediata."""
    headers = {
        "x-publora-key": PUBLORA_KEY,
        "Content-Type": "application/json",
    }

    agora = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    print(f"\n🚀 Publicando no Instagram...")
    r = requests.put(
        f"{PUBLORA_BASE}/update-post/{post_group_id}",
        headers=headers,
        json={
            "status": "scheduled",
            "scheduledTime": agora,
            "platformSettings": {"instagram": {"videoType": "REELS"}},
        },
        timeout=30,
    )

    if r.ok:
        print(f"✅ Reel agendado para publicação imediata!")
        return True
    else:
        print(f"❌ Erro ao publicar: {r.status_code} — {r.text[:300]}")
        return False


def upload_0x0(video_path: Path) -> "str | None":
    """Faz upload do vídeo para o 0x0.st e retorna a URL permanente."""
    print("\n📤 Fazendo upload para 0x0.st...")
    tamanho_mb = video_path.stat().st_size / (1024 * 1024)
    print(f"   Enviando {video_path.name} ({tamanho_mb:.1f} MB)...")

    with open(video_path, "rb") as f:
        r = requests.post(
            "https://0x0.st",
            files={"file": (video_path.name, f, "video/mp4")},
            timeout=300,
        )

    if r.ok and r.text.strip().startswith("https://"):
        url = r.text.strip()
        print(f"✅ Upload 0x0.st concluído: {url}")
        return url

    print(f"❌ Erro no upload 0x0.st: {r.status_code} — {r.text[:200]}")
    return None


def postar_via_make(video_url: str, caption: str) -> bool:
    """Envia a URL do vídeo e a legenda para o webhook do Make.com."""
    if not MAKE_WEBHOOK:
        print("❌ MAKE_WEBHOOK_URL não configurado no .env")
        return False

    print("\n🔗 Enviando para Make.com → Instagram...")
    r = requests.post(
        MAKE_WEBHOOK,
        json={"video_url": video_url, "caption": caption},
        timeout=30,
    )

    if r.ok:
        print("✅ Make.com recebeu a requisição — Reel sendo postado!")
        return True
    else:
        print(f"❌ Make.com retornou erro: {r.status_code} — {r.text[:200]}")
        return False


def postar_fallback_make(video_path: Path, caption: str) -> bool:
    """Fallback: 0x0.st (URL permanente) → Make.com → Instagram."""
    print("\n🔄 Usando fallback: 0x0.st + Make.com")
    video_url = upload_0x0(video_path)
    if not video_url:
        return False
    return postar_via_make(video_url, caption)


def postar_video(video_path: Path, caption: str, forcar_make: bool = False) -> bool:
    """Tenta Publora; se falhar ou --make, usa Discord + Make.com."""
    if forcar_make or not PUBLORA_KEY or not INSTAGRAM_PLATFORM:
        if forcar_make:
            print("\n   (modo --make: usando Make.com diretamente)")
        return postar_fallback_make(video_path, caption)

    # Tenta Publora primeiro
    post_group_id = fazer_upload_publora(video_path, caption)
    if post_group_id:
        sucesso = publicar_agora(post_group_id)
        if sucesso:
            return True
        print("\n⚠️  Publora: publicação falhou. Tentando fallback Make.com...")

    else:
        print("\n⚠️  Publora: upload falhou. Tentando fallback Make.com...")

    return postar_fallback_make(video_path, caption)


def obter_credenciais_youtube():
    """Carrega/renova/cria token OAuth do YouTube."""
    creds = None
    if YOUTUBE_TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(YOUTUBE_TOKEN_FILE), YOUTUBE_SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(YOUTUBE_CLIENT_SECRET), YOUTUBE_SCOPES)
            creds = flow.run_local_server(port=0)
        YOUTUBE_TOKEN_FILE.write_text(creds.to_json())
    return creds


def upload_youtube(video_path: Path, titulo: str, descricao: str) -> bool:
    """Faz upload do vídeo para o YouTube via API v3."""
    print("\n▶️  YOUTUBE")
    print("   Autenticando com Google...")
    try:
        creds = obter_credenciais_youtube()
        youtube = build("youtube", "v3", credentials=creds)
        body = {
            "snippet": {
                "title": titulo,
                "description": descricao,
                "tags": ["shorts", "financas", "dinheiro", "investimentos"],
                "categoryId": "22",
            },
            "status": {"privacyStatus": "public"},
        }
        media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True)
        request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
        print("   Enviando vídeo...")
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                pct = int(status.progress() * 100)
                print(f"   Upload: {pct}%", end="\r")
        print(f"   ✅ YouTube: https://youtube.com/shorts/{response['id']}")
        return True
    except Exception as e:
        print(f"   ❌ YouTube API erro: {e}")
        return False


def postar_youtube_make(video_url: str, titulo: str, descricao: str) -> bool:
    """Fallback: envia para Make.com postar no YouTube."""
    if not YOUTUBE_MAKE_WEBHOOK:
        print("   ⚠️  YOUTUBE_MAKE_WEBHOOK_URL não configurado — pulando YouTube.")
        return False
    print("   📡 Enviando para Make.com (YouTube)...")
    try:
        r = requests.post(YOUTUBE_MAKE_WEBHOOK, json={"video_url": video_url, "titulo": titulo, "descricao": descricao}, timeout=30)
        if r.ok:
            print("   ✅ Make.com: webhook YouTube disparado")
            return True
        print(f"   ❌ Make.com YouTube: {r.status_code} {r.text[:200]}")
        return False
    except Exception as e:
        print(f"   ❌ Make.com YouTube erro: {e}")
        return False


def postar_todas_redes(video_path: Path, caption: str, tema: str, forcar_make: bool = False) -> bool:
    """Posta o vídeo em todas as redes: Instagram + YouTube."""
    resultados = {}

    # ── Instagram ──────────────────────────────────────────────────────────────
    print("\n📱 INSTAGRAM")
    resultados["instagram"] = postar_video(video_path, caption, forcar_make=forcar_make)

    # ── YouTube ────────────────────────────────────────────────────────────────
    titulo_yt   = f"{tema.capitalize()} 💰 #shorts"
    descricao_yt = f"{caption}\n\n#Shorts"
    yt_ok = False

    if not forcar_make and YOUTUBE_DISPONIVEL and YOUTUBE_CLIENT_SECRET.exists():
        yt_ok = upload_youtube(video_path, titulo_yt, descricao_yt)

    if not yt_ok:
        # Fallback: Make.com
        video_url = None
        try:
            video_url = upload_0x0(video_path)
        except Exception:
            pass
        if video_url:
            yt_ok = postar_youtube_make(video_url, titulo_yt, descricao_yt)
        else:
            yt_ok = postar_youtube_make("", titulo_yt, descricao_yt)

    resultados["youtube"] = yt_ok

    # ── Resumo ─────────────────────────────────────────────────────────────────
    print("\n📊 Resultado:")
    for rede, ok in resultados.items():
        print(f"   {'✅' if ok else '❌'} {rede.capitalize()}")

    return any(resultados.values())


def montar_caption(tema: str) -> str:
    return f"{tema.capitalize()} — o que você precisava saber 💰\n\n{HASHTAGS_BASE}"


def main():
    parser = argparse.ArgumentParser(description="Gera e posta Reels de finanças no Instagram")
    parser.add_argument("tema", nargs="?", help="Tema do vídeo (opcional)")
    parser.add_argument("--dry-run", action="store_true", help="Só gera o vídeo, não posta")
    parser.add_argument("--video", metavar="CAMINHO", help="Posta um vídeo já gerado sem regerar")
    parser.add_argument("--make", action="store_true", help="Força o uso do Make.com (ignora Publora)")
    parser.add_argument("--ai-image", action="store_true",
                         help="Fundo com imagens geradas por IA (ComfyUI); cai para Pixabay se falhar")
    parser.add_argument("--purffle", action="store_true",
                         help="Usa o pipeline legado purffle-shorts + edge-tts em vez de Remotion + XTTS v2")
    args = parser.parse_args()

    # Validação de chaves
    faltando = []
    if not args.make:
        if not PUBLORA_KEY:        faltando.append("PUBLORA_API_KEY")
        if not INSTAGRAM_PLATFORM: faltando.append("INSTAGRAM_PLATFORM_ID")
    else:
        if not MAKE_WEBHOOK: faltando.append("MAKE_WEBHOOK_URL")

    if not args.video:
        if not PIXABAY_KEY: faltando.append("PIXABAY_API_KEY")
        if not GEMINI_KEY:  faltando.append("GEMINI_API_KEY")

    if faltando and not args.dry_run:
        print(f"❌ Chaves faltando no .env: {', '.join(faltando)}")
        sys.exit(1)

    # ── Modo --video: posta vídeo já existente ────────────────────────────────
    if args.video:
        video_path = Path(args.video)
        if not video_path.exists():
            print(f"❌ Arquivo não encontrado: {video_path}")
            sys.exit(1)

        tema    = escolher_tema(args.tema)
        caption = montar_caption(tema)

        print("=" * 60)
        print("📱 PIPELINE INSTAGRAM REELS — FINANÇAS PESSOAIS")
        print("=" * 60)
        print(f"📌 Tema: {tema}")
        print(f"🎞️  Vídeo: {video_path.name}")
        print()

        sucesso = postar_todas_redes(video_path, caption, tema, forcar_make=args.make)

        if sucesso:
            salvar_historico(carregar_historico(), tema)
            print(f"\n🎉 Reel postado com sucesso no Instagram!")
            print(f"   Tema: {tema}")
        else:
            print(f"\n❌ Falha ao postar. Vídeo disponível em: {video_path}")
            sys.exit(1)
        return

    # ── Fluxo normal: gera + posta ────────────────────────────────────────────
    tema    = escolher_tema(args.tema)
    caption = montar_caption(tema)

    print("=" * 60)
    print("📱 PIPELINE INSTAGRAM REELS — FINANÇAS PESSOAIS")
    print("=" * 60)
    print(f"📌 Tema: {tema}")
    if args.purffle:
        print("🎨 Modo: purffle-shorts (legado, edge-tts)")
    if args.dry_run:
        print("🔍 Modo dry-run: vídeo será gerado mas não postado")
    print()

    if args.purffle:
        video_path = gerar_video_purffle(tema, VIDEOS_DIR)
    else:
        video_path, caption_motion = gerar_video_motion(tema, ai_image=args.ai_image)
        if caption_motion:
            caption = caption_motion

    if not video_path:
        print("\n❌ Falha na geração do vídeo.")
        sys.exit(1)

    if args.dry_run:
        print(f"\n✅ DRY RUN concluído!")
        print(f"   Vídeo salvo em: {video_path}")
        print(f"   Para postar: reel --video '{video_path}'")
        sys.exit(0)

    sucesso = postar_todas_redes(video_path, caption, tema, forcar_make=args.make)

    if sucesso:
        salvar_historico(carregar_historico(), tema)
        print(f"\n🎉 Reel postado com sucesso no Instagram!")
        print(f"   Tema: {tema}")
    else:
        print(f"\n❌ Falha ao postar. Vídeo disponível em: {video_path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
