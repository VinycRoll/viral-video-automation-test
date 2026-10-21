#!/bin/bash
# instalar.sh — Instala dependências do pipeline Instagram Reels

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── 1. ffmpeg ────────────────────────────────────────────────────────────────
echo "📦 Instalando ffmpeg..."
if command -v apt &>/dev/null; then
    sudo apt install ffmpeg -y
elif command -v brew &>/dev/null; then
    brew install ffmpeg
else
    echo "⚠️  Instale o ffmpeg manualmente: https://ffmpeg.org/download.html"
fi

# ── 2. Node.js (necessário para o Remotion) ──────────────────────────────────
echo ""
echo "📦 Verificando Node.js..."
if ! command -v node &>/dev/null; then
    echo "   Node.js não encontrado. Instalando via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "   Node.js $(node --version) encontrado ✅"
fi

# ── 3. Dependências Python ───────────────────────────────────────────────────
echo ""
echo "📦 Instalando dependências Python..."
echo "   requests, python-dotenv              — utilitários do pipeline"
echo "   coqui-tts, torch, soundfile          — narração local (XTTS v2, pt-br)"
echo "   google-auth-oauthlib, google-api-python-client — upload YouTube"
pip install requests python-dotenv coqui-tts torch torchaudio soundfile \
    google-auth-oauthlib google-api-python-client --break-system-packages

# ── 4. purffle-shorts (submódulo) ────────────────────────────────────────────
echo ""
echo "📦 Instalando purffle-shorts (submódulo)..."
cd "$SCRIPT_DIR/viral-video-automation"
pip install -e . --break-system-packages
cd "$SCRIPT_DIR"

# ── 5. Template Remotion ─────────────────────────────────────────────────────
echo ""
echo "📦 Configurando template Remotion (motion graphics)..."

if [ -f "$SCRIPT_DIR/remotion-template.tar.gz" ]; then
    echo "   Extraindo remotion-template.tar.gz..."
    tar -xzf "$SCRIPT_DIR/remotion-template.tar.gz" -C "$SCRIPT_DIR"
    rm "$SCRIPT_DIR/remotion-template.tar.gz"
fi

if [ -d "$SCRIPT_DIR/remotion-template" ]; then
    echo "   Instalando pacotes npm (pode demorar ~2 min na primeira vez)..."
    cd "$SCRIPT_DIR/remotion-template"
    npm install --legacy-peer-deps
    cd "$SCRIPT_DIR"
    echo "   Remotion instalado ✅"
else
    echo "   ⚠️  Pasta remotion-template não encontrada. Pulando."
fi

# ── 6. ComfyUI (opcional — geração de imagens local para --ai-image) ─────────
echo ""
if [ -t 0 ]; then
    read -r -p "🖼️  Deseja instalar o ComfyUI para geração de imagens local? (s/n) " RESPOSTA_COMFYUI
else
    RESPOSTA_COMFYUI="n"
    echo "🖼️  Instalação não-interativa detectada — pulando ComfyUI (instale depois se quiser)."
fi

if [[ "$RESPOSTA_COMFYUI" =~ ^[sS]$ ]]; then
    if ! command -v git &>/dev/null; then
        echo "   ❌ git não encontrado — instale o git e rode este script novamente para configurar o ComfyUI."
    else
        echo ""
        echo "📦 Instalando ComfyUI..."
        COMFYUI_DIR="$SCRIPT_DIR/ComfyUI"

        if [ -d "$COMFYUI_DIR" ]; then
            echo "   ComfyUI já existe em $COMFYUI_DIR — pulando clone."
        else
            git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git "$COMFYUI_DIR"
        fi

        echo "   Instalando dependências do ComfyUI (pode demorar alguns minutos)..."
        cd "$COMFYUI_DIR"
        pip install -r requirements.txt --break-system-packages
        cd "$SCRIPT_DIR"

        CKPT_DIR="$COMFYUI_DIR/models/checkpoints"
        mkdir -p "$CKPT_DIR"
        CKPT_FILE="$CKPT_DIR/v1-5-pruned-emaonly-fp16.safetensors"

        if [ -f "$CKPT_FILE" ]; then
            echo "   Checkpoint SD 1.5 já presente — pulando download."
        else
            echo "   Baixando checkpoint SD 1.5 fp16 (~2.1 GB — leve o suficiente para GPUs com 4GB VRAM)..."
            curl -L --fail -o "$CKPT_FILE" \
                "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors" \
                || { echo "   ❌ Falha no download. Baixe manualmente em https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive e salve em $CKPT_DIR"; rm -f "$CKPT_FILE"; }
        fi

        echo ""
        echo "   ✅ ComfyUI instalado em: $COMFYUI_DIR"
        echo "   Checkpoint configurado: v1-5-pruned-emaonly-fp16.safetensors (já é o padrão em COMFYUI_CHECKPOINT)"
        echo "   ⚠️  Se sua GPU tiver CUDA, confira em https://pytorch.org se o torch instalado tem suporte a ela"
        echo "      (o requirements.txt do ComfyUI pode ter instalado uma versão CPU-only por padrão)."
    fi
else
    echo "   ⏭️  Pulando instalação do ComfyUI."
    echo "      Para instalar depois: https://github.com/comfyanonymous/ComfyUI"
    echo "      Sem o ComfyUI rodando em localhost:8188, 'reel --motion --ai-image' usa o Pixabay automaticamente."
fi

# ── 7. Alias 'reel' no .bashrc/.zshrc ─────────────────────────────────────────
echo ""
echo "📦 Configurando alias 'reel'..."
ALIAS_LINE="alias reel='python3 \"$SCRIPT_DIR/post_reel.py\"'"

for RC_FILE in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$RC_FILE" ]; then
        if grep -q "^alias reel=" "$RC_FILE" 2>/dev/null; then
            echo "   Alias 'reel' já configurado em $(basename "$RC_FILE") — pulando."
        else
            echo "" >> "$RC_FILE"
            echo "$ALIAS_LINE" >> "$RC_FILE"
            echo "   Alias 'reel' adicionado em $(basename "$RC_FILE") ✅"
        fi
    fi
done
echo "   Rode 'source ~/.bashrc' (ou ~/.zshrc, ou abra um novo terminal) para usar o comando 'reel'."

# ── Concluído ────────────────────────────────────────────────────────────────
echo ""
echo "✅ Instalação concluída!"
echo ""
echo "🚀 Como usar:"
echo "   reel                          # purffle-shorts + posta (tema aleatório)"
echo "   reel 'renda extra'            # tema específico"
echo "   reel --dry-run                # só gera o vídeo (sem postar)"
echo "   reel --make --video f.mp4    # força Make.com (fallback manual)"
echo ""
echo "   # Motion graphics (estilo animado):"
echo "   reel --motion                 # Remotion + XTTS v2 (tema aleatório)"
echo "   reel --motion --ai-image      # + imagens de fundo com Ken Burns (ComfyUI, fallback Pixabay)"
echo ""
if [ -d "$SCRIPT_DIR/ComfyUI" ]; then
    echo "   # Antes de usar --ai-image, inicie o ComfyUI em outro terminal:"
    echo "   cd ComfyUI && python3 main.py --lowvram   # fica em http://localhost:8188"
fi
