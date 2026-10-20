#!/usr/bin/env python3
"""
post_reel.py — Pipeline automático de Instagram Reels sobre finanças pessoais.

Fluxo:
  1. Escolhe um tema viral de finanças
  2. Chama o purffle-shorts para gerar o vídeo (Gemini → roteiro, edge-tts → narração, Pixabay → imagens)
  3. Faz upload do MP4 para o Publora
  4. Posta no Instagram como Reel

Uso:
  python3 post_reel.py                  # tema aleatório
  python3 post_reel.py 'renda extra'    # tema específico
  python3 post_reel.py --dry-run        # só gera o vídeo, não posta
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

# ── Caminhos ──────────────────────────────────────────────────────────────────
SCRIPT_DIR    = Path(__file__).parent
PURFFLE_DIR   = Path("/home/vinycius/Área de trabalho/PROJETOS/purffle-shorts-test")
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
    env["VISUAL_SOURCES"]  = "pixabay,pollinations"  # Pixabay primeiro; Pollinations (IA) como fallback
    env["KEEP_VIDEOS"]     = "true"
    env["SCRIPT_REVIEW"]   = "rewrite"  # Script Doctor reescreve roteiros fracos
    # Contexto do canal — melhora muito a qualidade do roteiro
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
    env["OUTPUT_DIR"] = str(pasta_saida)  # purffle usa esta variável de ambiente

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
            # fallback: procura em output_videos dentro do purffle
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

    # 1. Criar rascunho
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

    # 2. Obter URL de upload pré-assinada
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

    # 3. Enviar o arquivo via PUT
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


def montar_caption(tema: str) -> str:
    return f"{tema.capitalize()} — o que você precisava saber 💰\n\n{HASHTAGS_BASE}"


def main():
    parser = argparse.ArgumentParser(description="Gera e posta Reels de finanças no Instagram")
    parser.add_argument("tema", nargs="?", help="Tema do vídeo (opcional)")
    parser.add_argument("--dry-run", action="store_true", help="Só gera o vídeo, não posta")
    args = parser.parse_args()

    faltando = []
    if not PUBLORA_KEY:   faltando.append("PUBLORA_API_KEY")
    if not INSTAGRAM_PLATFORM: faltando.append("INSTAGRAM_PLATFORM_ID")
    if not PIXABAY_KEY:   faltando.append("PIXABAY_API_KEY")
    if not GEMINI_KEY:    faltando.append("GEMINI_API_KEY")

    if faltando and not args.dry_run:
        print(f"❌ Chaves faltando: {', '.join(faltando)}")
        sys.exit(1)

    tema    = escolher_tema(args.tema)
    caption = montar_caption(tema)

    print("=" * 60)
    print("📱 PIPELINE INSTAGRAM REELS — FINANÇAS PESSOAIS")
    print("=" * 60)
    print(f"📌 Tema: {tema}")
    if args.dry_run:
        print("🔍 Modo dry-run: vídeo será gerado mas não postado")
    print()

    # 1. Gera o vídeo
    video_path = gerar_video_purffle(tema, VIDEOS_DIR)

    if not video_path:
        print("\n❌ Falha na geração do vídeo.")
        sys.exit(1)

    if args.dry_run:
        print(f"\n✅ DRY RUN concluído!")
        print(f"   Vídeo salvo em: {video_path}")
        sys.exit(0)

    # 2. Upload + publicar
    post_group_id = fazer_upload_publora(video_path, caption)

    if not post_group_id:
        print(f"\n⚠️  Upload falhou. Vídeo disponível em: {video_path}")
        sys.exit(1)

    sucesso = publicar_agora(post_group_id)

    if sucesso:
        salvar_historico(carregar_historico(), tema)
        print(f"\n🎉 Reel postado com sucesso no Instagram!")
        print(f"   Tema: {tema}")
    else:
        print(f"\n⚠️  Vídeo enviado, mas publicação falhou.")
        print(f"   Publique manualmente no Publora: postGroupId = {post_group_id}")


if __name__ == "__main__":
    main()
