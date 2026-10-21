@echo off
REM instalar.bat — Instala dependencias do pipeline Instagram Reels (Windows nativo, sem WSL)
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"

echo ===============================================
echo  Instagram Reels - Instalador (Windows)
echo ===============================================
echo.

REM ── 1. ffmpeg ──────────────────────────────────────────────────────────────
echo [1/8] Instalando ffmpeg...
where ffmpeg >nul 2>nul
if %errorlevel%==0 (
    echo    ffmpeg ja esta instalado ✅
) else (
    where winget >nul 2>nul
    if %errorlevel%==0 (
        winget install ffmpeg --accept-source-agreements --accept-package-agreements
    ) else (
        echo    ⚠️  winget nao encontrado.
        echo    Baixe o ffmpeg manualmente em https://ffmpeg.org/download.html
        echo    e adicione a pasta "bin" extraida ao PATH do Windows.
    )
)
echo.

REM ── 2. Node.js (necessario para o Remotion) ─────────────────────────────────
echo [2/8] Verificando Node.js...
where node >nul 2>nul
if %errorlevel%==0 (
    for /f "delims=" %%v in ('node --version') do echo    Node.js %%v encontrado ✅
) else (
    where winget >nul 2>nul
    if %errorlevel%==0 (
        echo    Node.js nao encontrado. Instalando via winget...
        winget install OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
    ) else (
        echo    ⚠️  winget nao encontrado. Baixe o Node.js manualmente em https://nodejs.org
    )
)
echo.

REM ── 3. Python ────────────────────────────────────────────────────────────────
echo [3/8] Verificando Python...
where python >nul 2>nul
if %errorlevel%==0 (
    for /f "delims=" %%v in ('python --version') do echo    %%v encontrado ✅
) else (
    echo    ❌ Python nao encontrado.
    echo    Baixe em https://python.org e, durante a instalacao, marque a opcao
    echo    "Add python.exe to PATH" antes de clicar em Install.
    echo    Depois feche este terminal, abra um novo e rode instalar.bat novamente.
    pause
    exit /b 1
)
echo.

REM ── 4. Dependencias Python ────────────────────────────────────────────────────
echo [4/8] Instalando dependencias Python...
echo    requests, python-dotenv        — utilitarios do pipeline
echo    coqui-tts, torch, soundfile    — narracao local (XTTS v2, pt-br)
python -m pip install --upgrade pip
python -m pip install requests python-dotenv coqui-tts torch torchaudio soundfile
if errorlevel 1 (
    echo    ❌ Erro ao instalar dependencias Python.
    pause
    exit /b 1
)
echo.

REM ── 5. purffle-shorts (submodulo) ─────────────────────────────────────────────
echo [5/8] Instalando purffle-shorts (submodulo)...
if exist "%SCRIPT_DIR%viral-video-automation" (
    pushd "%SCRIPT_DIR%viral-video-automation"
    python -m pip install -e .
    popd
) else (
    echo    ⚠️  Pasta viral-video-automation nao encontrada — pulando.
)
echo.

REM ── 6. Template Remotion ──────────────────────────────────────────────────────
echo [6/8] Configurando template Remotion (motion graphics)...

if exist "%SCRIPT_DIR%remotion-template.tar.gz" (
    echo    Extraindo remotion-template.tar.gz...
    tar -xzf "%SCRIPT_DIR%remotion-template.tar.gz" -C "%SCRIPT_DIR%"
    del "%SCRIPT_DIR%remotion-template.tar.gz"
)

if exist "%SCRIPT_DIR%remotion-template" (
    echo    Instalando pacotes npm (pode demorar ~2 min na primeira vez)...
    pushd "%SCRIPT_DIR%remotion-template"
    call npm install --legacy-peer-deps
    popd
    echo    Remotion instalado ✅
) else (
    echo    ⚠️  Pasta remotion-template nao encontrada — pulando.
)
echo.

REM ── 7. ComfyUI (opcional — geracao de imagens local para --ai-image) ──────────
echo [7/8] ComfyUI ^(opcional — geracao de imagens local para --ai-image^)
set "RESPOSTA_COMFYUI="
set /p RESPOSTA_COMFYUI="   Deseja instalar o ComfyUI para geracao de imagens local? (s/n) "

if /i "%RESPOSTA_COMFYUI%"=="s" (
    where git >nul 2>nul
    if errorlevel 1 (
        echo    ❌ git nao encontrado — instale o git e rode instalar.bat novamente para configurar o ComfyUI.
    ) else (
        set "COMFYUI_DIR=%SCRIPT_DIR%ComfyUI"

        if exist "!COMFYUI_DIR!" (
            echo    ComfyUI ja existe em !COMFYUI_DIR! — pulando clone.
        ) else (
            git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git "!COMFYUI_DIR!"
        )

        echo    Instalando dependencias do ComfyUI (pode demorar alguns minutos)...
        pushd "!COMFYUI_DIR!"
        python -m pip install -r requirements.txt
        popd

        set "CKPT_DIR=!COMFYUI_DIR!\models\checkpoints"
        if not exist "!CKPT_DIR!" mkdir "!CKPT_DIR!"
        set "CKPT_FILE=!CKPT_DIR!\v1-5-pruned-emaonly-fp16.safetensors"

        if exist "!CKPT_FILE!" (
            echo    Checkpoint SD 1.5 ja presente — pulando download.
        ) else (
            echo    Baixando checkpoint SD 1.5 fp16 (~2.1 GB — leve o suficiente para GPUs com 4GB VRAM)...
            curl -L --fail -o "!CKPT_FILE!" "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors"
            if errorlevel 1 (
                echo    ❌ Falha no download. Baixe manualmente em https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive
                echo       e salve em !CKPT_DIR!
                del "!CKPT_FILE!" 2>nul
            )
        )

        echo.
        echo    ✅ ComfyUI instalado em: !COMFYUI_DIR!
        echo    Checkpoint configurado: v1-5-pruned-emaonly-fp16.safetensors (ja e o padrao em COMFYUI_CHECKPOINT)
        echo    ⚠️  Se sua GPU tiver CUDA, confira em https://pytorch.org se o torch instalado tem suporte a ela
        echo       (o requirements.txt do ComfyUI pode ter instalado uma versao CPU-only por padrao).
    )
) else (
    echo    ⏭️  Pulando instalacao do ComfyUI.
    echo       Para instalar depois: https://github.com/comfyanonymous/ComfyUI
    echo       Sem o ComfyUI rodando em localhost:8188, "reel --motion --ai-image" usa o Pixabay automaticamente.
)
echo.

REM ── 8. Comando 'reel' (sem alias no Windows — cria reel.bat + adiciona ao PATH) ─
echo [8/8] Configurando o comando 'reel'...
set "REEL_BAT=%SCRIPT_DIR%reel.bat"
(
    echo @echo off
    echo python "%SCRIPT_DIR%post_reel.py" %%*
) > "%REEL_BAT%"
echo    Criado: %REEL_BAT%

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$dir = '%SCRIPT_DIR%'.TrimEnd('\'); $userPath = [Environment]::GetEnvironmentVariable('PATH','User'); if ($userPath -notlike ('*' + $dir + '*')) { $newPath = if ($userPath) { $userPath.TrimEnd(';') + ';' + $dir } else { $dir }; [Environment]::SetEnvironmentVariable('PATH', $newPath, 'User'); Write-Host '   Pasta adicionada ao PATH do usuario ✅' } else { Write-Host '   Pasta ja esta no PATH do usuario — pulando.' }"

echo.
echo    ⚠️  Feche e reabra o terminal (CMD/PowerShell/Windows Terminal) para o
echo       comando 'reel' funcionar em qualquer pasta.
echo.

REM ── Concluido ──────────────────────────────────────────────────────────────────
echo ===============================================
echo  ✅ Instalacao concluida!
echo ===============================================
echo.
echo 🚀 Como usar:
echo    reel                              purffle-shorts + posta (tema aleatorio)
echo    reel "renda extra"                tema especifico
echo    reel --dry-run                    so gera o video (sem postar)
echo    reel --make --video f.mp4         forca Make.com (fallback manual)
echo.
echo    REM Motion graphics (estilo animado):
echo    reel --motion                     Remotion + XTTS v2 (tema aleatorio)
echo    reel --motion --ai-image          + imagens de fundo com Ken Burns (ComfyUI, fallback Pixabay)
echo.
echo    Exemplo completo:
echo    reel "renda extra" --motion --dry-run
echo.
if exist "%SCRIPT_DIR%ComfyUI" (
    echo    Antes de usar --ai-image, inicie o ComfyUI em outro terminal:
    echo    cd ComfyUI ^&^& python main.py --lowvram   ^(fica em http://localhost:8188^)
    echo.
)
pause
