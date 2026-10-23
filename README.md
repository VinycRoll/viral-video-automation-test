# 📱 Instagram Reels — Pipeline Automático de Finanças Pessoais

Gera e posta Reels sobre finanças pessoais no Instagram automaticamente com um único comando.

**Tecnologias:**
- 🤖 **Gemini** — gera o roteiro
- 🔊 **XTTS v2 (Coqui TTS)** — narração em português, local e grátis (sem API key)
- 🎬 **Pixabay** — imagens de fundo com Ken Burns, por padrão
- 🖼️ **ComfyUI (SD 1.5)** — opcional: imagens de fundo geradas por IA no modo `--ai-image` (fallback Pixabay)
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
reel                        # tema aleatório (Remotion + XTTS v2 + Pixabay)
reel 'renda passiva'        # tema específico
reel --dry-run              # só gera o vídeo, não posta
reel --video caminho.mp4    # posta um vídeo já gerado (pula a geração)
reel --ai-image             # fundo com imagens de IA via ComfyUI (SD 1.5) com Ken Burns
                             # (sobe o ComfyUI automaticamente se ele não estiver rodando, e o
                             #  encerra ao final; usa Pixabay se o ComfyUI falhar/não existir)
reel --purffle              # usa o pipeline legado purffle-shorts + edge-tts
```

> **ComfyUI (opcional):** o `instalar.sh` pergunta se você quer instalar o ComfyUI automaticamente
> (clona o repositório, instala dependências e baixa o checkpoint SD 1.5 fp16, ~2.1 GB — leve o
> suficiente para GPUs com 4GB de VRAM). Com `--ai-image`, o `gerar_motion.py` sobe o ComfyUI em
> background sozinho (espera até ~`COMFYUI_AUTOSTART_TIMEOUT` segundos, 120 por padrão, ele ficar
> pronto) e encerra o processo automaticamente ao fim da geração das imagens — não precisa abrir
> outro terminal. Se já tiver um ComfyUI seu rodando em `COMFYUI_URL`, ele é reaproveitado e não é
> encerrado por este script. Para subir manualmente (debug):
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
