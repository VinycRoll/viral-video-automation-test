EXECUÇÃO — Etapa 6: Geração do Vídeo (dry-run)

Comando: post_reel.py --dry-run "31% dos brasileiros não têm reserva de emergência"
Resultado: ERRO
Mensagem: Dependências Python faltando — importError no TTS (coqui-tts). Stderr: "❌ Instale: pip install requests python-dotenv coqui-tts soundfile --break-system-packages"

Detalhes:
- Tentativa 1: post_reel.py invocou gerar_motion.py, que falhou ao importar TTS
- Tentativa 2: Instalação de dependências PyTorch necessárias para coqui-tts
  - torch-2.15.0-cp313-cp313-manylinux_2_28_x86_64.whl: 539.2 MB ✓
  - nvidia_cudnn_cu13-9.26.0.51: 519.2 MB ✗
  
ERRO CRÍTICO: OSError [Errno 28] Não há espaço disponível no dispositivo

Stack trace completo:
```
ERROR: Could not install packages due to an OSError: [Errno 28] Não há espaço disponível no dispositivo
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 207.4/519.2 MB 11.5 MB/s eta 0:00:28
```

Diagnóstico: Sistema de arquivos é tmpfs/overlayfs com espaço limitado. Necessário ~1.5GB para instalação completa de PyTorch + CUDA toolkit, mas ambiente não forneceu espaço suficiente.

Ação necessária: Liberar espaço em disco ou usar environment com espaço suficiente para dependências de GPU.
