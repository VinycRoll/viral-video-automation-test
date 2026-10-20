#!/bin/bash
# instalar.sh — Instala dependências do pipeline Instagram Reels

echo "📦 Instalando dependências Python..."
pip install requests python-dotenv edge-tts --break-system-packages

echo ""
echo "📦 Instalando purffle-shorts no projeto..."
cd "/home/vinycius/Área de trabalho/PROJETOS/purffle-shorts-test"
pip install -e . --break-system-packages

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "🚀 Como usar:"
echo "   cd ~/instagram-content"
echo "   python3 post_reel.py                   # tema aleatório + posta"
echo "   python3 post_reel.py 'renda extra'     # tema específico + posta"
echo "   python3 post_reel.py --dry-run         # só gera o vídeo (sem postar)"
