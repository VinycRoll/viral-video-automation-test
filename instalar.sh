#!/bin/bash
# instalar.sh — Instala dependências do pipeline Instagram Reels

set -e  # para se der erro

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Instalando dependências do sistema (ffmpeg)..."
if command -v apt &>/dev/null; then
    sudo apt install ffmpeg -y
elif command -v brew &>/dev/null; then
    brew install ffmpeg
else
    echo "⚠️  Instale o ffmpeg manualmente: https://ffmpeg.org/download.html"
fi

echo ""
echo "📦 Instalando dependências Python..."
pip install requests python-dotenv edge-tts --break-system-packages

echo ""
echo "📦 Instalando purffle-shorts (submódulo)..."
cd "$SCRIPT_DIR/viral-video-automation"
pip install -e . --break-system-packages

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "🚀 Como usar:"
echo "   reel                        # tema aleatório + posta"
echo "   reel 'renda extra'          # tema específico + posta"
echo "   reel --dry-run              # só gera o vídeo (sem postar)"
echo "   reel --make --video f.mp4  # força Make.com (fallback manual)"
