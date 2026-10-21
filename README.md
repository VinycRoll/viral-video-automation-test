# 📱 Instagram Reels — Pipeline Automático de Finanças Pessoais

Gera e posta Reels sobre finanças pessoais no Instagram automaticamente com um único comando.

**Tecnologias:**
- 🤖 **Gemini** — gera o roteiro
- 🔊 **edge-tts** — narração em português (grátis, sem API key)
- 🎬 **Pixabay** — footage de vídeo stock
- 📲 **Publora** — posta no Instagram via API

---

## ⚙️ Instalação

### Pré-requisitos
- Python 3.10+
- pip
- Git

### Passo a passo

```bash
# 1. Clone o projeto com o submódulo
git clone --recurse-submodules https://github.com/VinycRoll/viral-video-automation
cd viral-video-automation

# 2. Execute o instalador
bash instalar.sh
```

O instalador vai:
- Instalar as dependências Python
- Configurar o motor de vídeo (viral-video-automation)
- Criar o arquivo `.env` com os campos para preencher
- Adicionar o comando `reel` ao seu terminal

### 3. Preencha as chaves no `.env`

```env
PUBLORA_API_KEY=...        # https://publora.com
INSTAGRAM_PLATFORM_ID=...  # ID da sua conta no Publora

PIXABAY_API_KEY=...        # https://pixabay.com/api/docs (grátis)

GEMINI_API_KEY=...         # https://aistudio.google.com (grátis)
```

---

## 🚀 Uso

```bash
reel                        # tema aleatório
reel 'renda passiva'        # tema específico
reel --dry-run              # só gera o vídeo, não posta
```

---

## 📁 Estrutura

```
instagram-reels/
├── post_reel.py              # script principal
├── instalar.sh               # instalador
├── .env                      # suas chaves (não sobe para o Git)
├── videos_gerados/           # vídeos gerados (não sobe para o Git)
└── viral-video-automation/   # submódulo: engine de geração de vídeo
```
