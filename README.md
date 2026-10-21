# 📱 Instagram Reels — Pipeline Automático de Finanças Pessoais

Gera e posta Reels sobre finanças pessoais no Instagram automaticamente com um único comando.

**Tecnologias:**
- 🤖 **Gemini** — gera o roteiro
- 🔊 **XTTS v2 (Coqui TTS)** — narração em português, local e grátis (sem API key)
- 🎬 **Pixabay** — footage de vídeo stock (ou fallback de imagens no modo `--motion --ai-image`)
- 🖼️ **ComfyUI (SD 1.5)** — opcional: gera imagens de fundo com Ken Burns no modo `--motion --ai-image`
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
reel --video caminho.mp4    # posta um vídeo já gerado (pula a geração)
reel --motion               # usa Remotion (motion graphics) ao invés do purffle-shorts
reel --motion --ai-image    # + imagens de fundo via ComfyUI (SD 1.5) com Ken Burns
                             # (usa Pixabay automaticamente se o ComfyUI não estiver rodando em localhost:8188)
```

> **ComfyUI (opcional):** o `instalar.sh` pergunta se você quer instalar o ComfyUI automaticamente
> (clona o repositório, instala dependências e baixa o checkpoint SD 1.5 fp16, ~2.1 GB — leve o
> suficiente para GPUs com 4GB de VRAM). Para usar `--ai-image`, inicie-o antes:
> ```bash
> cd ComfyUI && python3 main.py --lowvram   # http://localhost:8188
> ```
> Configure no `.env` se precisar mudar algo:
> ```env
> COMFYUI_URL=http://localhost:8188
> COMFYUI_CHECKPOINT=v1-5-pruned-emaonly-fp16.safetensors
> COMFYUI_WIDTH=512
> COMFYUI_HEIGHT=768
> ```

> **Dica:** o `--dry-run` mostra o caminho exato do vídeo gerado. Use-o com `--video` para postar depois:
> ```bash
> reel --dry-run
> # ✅ Vídeo salvo em: videos_gerados/.../short.mp4
> # Para postar: reel --video 'videos_gerados/.../short.mp4'
> ```

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
