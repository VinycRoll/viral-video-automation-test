#!/usr/bin/env python3
"""
gerar_motion.py — Gera roteiro JSON via Gemini, narração via XTTS v2,
imagens de fundo via Pixabay (ou ComfyUI com --ai-image) e renderiza com Remotion.

Uso:
    python3 gerar_motion.py                    # tema aleatório, fundo com imagens do Pixabay
    python3 gerar_motion.py "juros compostos"  # tema específico
    python3 gerar_motion.py --dry-run          # só gera JSON + áudios, não renderiza
    python3 gerar_motion.py --ai-image         # imagens de fundo geradas por IA (ComfyUI);
                                                # cai para o Pixabay se o ComfyUI falhar/indisponível
"""

import os
import sys
import gc
import json
import copy
import shutil
import itertools
import signal
import subprocess
import datetime
import random
import time
import uuid
import pathlib
import re
from pathlib import Path

try:
    import requests
    from dotenv import load_dotenv
    import numpy as np
    import soundfile as sf
    from TTS.api import TTS
except ImportError:
    # O pacote "TTS" original (Coqui AI) não publica build para Python >=3.12 —
    # descontinuado desde o fechamento da empresa. Use o fork mantido "coqui-tts",
    # que preserva o mesmo namespace de import (TTS.api.TTS) usado abaixo.
    print("❌ Instale: pip install requests python-dotenv coqui-tts soundfile --break-system-packages")
    sys.exit(1)

# ── Config ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / ".env")
load_dotenv(SCRIPT_DIR.parent / "viral-video-automation" / ".env", override=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CHANNEL_NAME   = os.getenv("CHANNEL_NAME", "VinyBruno.ia")
ACCENT_COLOR   = os.getenv("ACCENT_COLOR", "#FFD700")
GEMINI_MODEL   = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")

# XTTS v2 (Coqui TTS) — roda localmente, sem API key.
XTTS_MODEL       = os.getenv("XTTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")
XTTS_LANGUAGE    = os.getenv("XTTS_LANGUAGE", "pt")
# Speaker embutido no modelo (não precisa de áudio de referência). Troque por
# outro nome de tts.speakers, ou defina XTTS_SPEAKER_WAV (.wav de 6-10s) para
# clonar uma voz específica em vez de usar um dos speakers pré-treinados.
XTTS_SPEAKER     = os.getenv("XTTS_SPEAKER", "Gilberto Mathias")
XTTS_SPEAKER_WAV = os.getenv("XTTS_SPEAKER_WAV", "")
# Parâmetros de inferência — speed um pouco acima de 1.0 e repetition_penalty
# no valor recomendado pelo paper da XTTS v2 deixam a fala menos monótona.
# O maior ganho de energia/expressividade, porém, vem de usar uma voz de
# referência real (XTTS_SPEAKER_WAV) em vez de um speaker pré-treinado — os
# speakers embutidos (como "Ana Florence") tendem a sair mais "planos".
XTTS_TEMPERATURE        = float(os.getenv("XTTS_TEMPERATURE", "0.85"))
XTTS_REPETITION_PENALTY = float(os.getenv("XTTS_REPETITION_PENALTY", "10.0"))
XTTS_SPEED              = float(os.getenv("XTTS_SPEED", "1.1"))
# Opt-in: ajusta os 3 parâmetros acima sozinho a cada geração, com base no
# histórico de notas manuais + QA automático (.historico_geracoes.json).
# Desligado (padrão) não muda nada; ligado, sem histórico cai nos defaults de cima.
XTTS_AUTOTUNE           = os.getenv("XTTS_AUTOTUNE", "0") == "1"
# XTTS v2 é distribuído sob a Coqui Public Model License (CPML - coqui.ai/cpml),
# que tem restrições para uso comercial. Ao baixar o modelo pela 1a vez, a lib
# pede confirmação interativa dos termos — isso trava um pipeline automatizado
# sem stdin, então aceitamos aqui. Revise a licença antes de usar em conteúdo
# monetizado.
os.environ.setdefault("COQUI_TOS_AGREED", "1")

# ComfyUI (SD 1.5 local) — fallback automático para Pixabay se não estiver rodando
COMFYUI_DIR        = SCRIPT_DIR.parent / "ComfyUI"
COMFYUI_URL        = os.getenv("COMFYUI_URL", "http://localhost:8188")
COMFYUI_CHECKPOINT = os.getenv("COMFYUI_CHECKPOINT", "v1-5-pruned-emaonly-fp16.safetensors")
COMFYUI_WIDTH      = int(os.getenv("COMFYUI_WIDTH", "512"))
COMFYUI_HEIGHT     = int(os.getenv("COMFYUI_HEIGHT", "768"))
COMFYUI_STEPS      = int(os.getenv("COMFYUI_STEPS", "20"))
COMFYUI_AUTOSTART_TIMEOUT = int(os.getenv("COMFYUI_AUTOSTART_TIMEOUT", "120"))
PIXABAY_KEY        = os.getenv("PIXABAY_API_KEY", "")

# Render sem GPU (CPU-only) pode passar de 5 minutos tranquilamente — timeout
# generoso para não abandonar um render que está progredindo normalmente.
REMOTION_RENDER_TIMEOUT = int(os.getenv("REMOTION_RENDER_TIMEOUT", "1200"))

# Endpoint OpenAI-compatible do Gemini (igual ao purffle-shorts — mais estável)
# Endpoint nativo do Gemini (não o compatível com OpenAI): desde a migração do
# Google para chaves no formato "AQ.Ab..." (meados de 2026), essas chaves novas
# são rejeitadas no endpoint /v1beta/openai/chat/completions com Authorization:
# Bearer — só funcionam no endpoint nativo, autenticadas via header
# x-goog-api-key. Chaves antigas "AIzaSy..." continuam funcionando aqui também.
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

TEMAS_FINANCAS = [
    "juros compostos e como multiplicar dinheiro",
    "como sair das dívidas em 6 meses",
    "o que é tesouro direto e como investir",
    "5 erros financeiros que todo iniciante comete",
    "como montar uma reserva de emergência",
    "renda passiva: o que é e como criar",
    "como funciona a inflação e como se proteger",
    "cartão de crédito: vilão ou aliado?",
    "como investir com R$ 50 por mês",
    "o que é FGTS e quando vale sacar",
]

# ── Prompt ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Você é um criador de conteúdo viral para Instagram Reels.
Dado um tema, crie um roteiro de vídeo de aproximadamente 60 segundos em formato JSON.
Adapte o tom, os exemplos e o vocabulário ao nicho do tema recebido — não use linguagem
de finanças em vídeos de culinária, nem linguagem técnica em vídeos de motivação, etc.
Se a mensagem não trouxer nenhum tema ou nicho definido, escolha você mesmo um tema
aleatório e interessante de qualquer nicho (finanças, culinária, saúde, produtividade,
história, motivação, curiosidades, relacionamentos, tecnologia etc.) e siga as mesmas
regras abaixo normalmente.

REGRAS VISUAIS:
- Use *texto* para destacar em amarelo e **texto** para branco bold
- Tipos de cena: intro, text, highlight, card, list, chapter, proof, growth, notification,
  calendar, clock, moneystack, checklist, progress, timer, rating, scale, map, weather,
  achievement, battery, book, thermometer, piggybank, receipt, roadmap, quote, alert, split,
  counter, sizecompare, xray, proportiongrid, speedrace, timelineera, orbit, dna, mythfact,
  redacted, magnify, censored, domino, treebranch, vsbattle, outro
- "chapter" é um card de abertura de capítulo (título curto, sem caixa de fundo) — use no
  máximo 1x por roteiro, só quando o vídeo realmente muda de assunto no meio (ex: depois de
  explicar o problema, antes de entrar na solução). Não use em roteiros muito curtos (<6 cenas)
- "proof" é um card com barras reais (ex: divisão de tempo, comparação de valores, ranking) em
  vez de foto — use quando o roteiro tiver uma divisão numérica concreta que dê pra mostrar em
  barra, no máximo 1x por roteiro, não é obrigatório. Campos: "proofTitle" (título curto) e
  "proofBars": lista de {"label": string, "value": "ex: 50%", "pct": número 0-100} — os números
  têm que ser os mesmos citados na narração, nunca invente valores diferentes
- "growth" é uma linha de crescimento desenhada ao vivo em vez de foto — use no clímax do
  roteiro, quando a narração descreve algo que CRESCE ao longo do tempo ou que MUDA de direção
  por causa de uma ação, no máximo 1x por roteiro, não é obrigatório. Campos: "growthTitle"
  (opcional, título curto), "growthPoints" (lista de {"x","y"} 0-100, x = progresso no tempo
  da linha, y = valor, 0 é a base e 100 o topo — use uma linha "serrilhada" parada para ilustrar
  estagnação e uma reta ascendente para ilustrar crescimento), "growthTurnIndex" (opcional,
  índice em growthPoints onde a linha muda de cor cinza→accent), "growthForkPoints" (opcional,
  2º ramo que sai do último ponto de growthPoints — só quando o roteiro compara 2 caminhos),
  "growthCounters" (opcional, lista de {"to": número, "prefix", "suffix", "label",
  "accent": true/false} — contador subindo de 0 até "to", números têm que vir da narração)
- "notification" é uma notificação de app aparecendo na tela de bloqueio do celular (em vez
  de foto) — use para um momento de "prova social" ou "resultado chegando" (ex: um alerta,
  confirmação, lembrete ou marco que o app do nicho mandaria), no máximo 1x por roteiro, não
  é obrigatório. O app e o remetente são FICTÍCIOS e têm que combinar com o nicho do roteiro
  (app de investimento p/ finanças, app de receitas p/ culinária, app de treino p/ saúde, app
  de hábitos p/ produtividade, etc. — nunca use um app de finanças em roteiro de outro nicho).
  Campos: "notifAppLetter" (1-2 letras do ícone do app), "notifAppColor" (gradiente CSS, ex:
  "linear-gradient(180deg,#8a7cff,#4636d9)"), "notifTitle" (nome do app/remetente), "notifBody"
  (frase real da notificação, sem markdown, tem que bater com o que a narração está dizendo),
  "notifTime" (ex: "agora"), "lockTime" (ex: "9:41"), "lockDate" (opcional). Campos opcionais
  "notifOlderTitle"/"notifOlderBody"/"notifOlderTime" para uma 2ª notificação mais antiga
  empilhada acima (visual mais rico, não obrigatório)
- "calendar" é um card de calendário de mesa (em vez de foto) — use quando o roteiro menciona
  uma DATA, PRAZO ou EVENTO específico (ex: dia do pagamento, prazo de um imposto, aniversário
  de uma meta), no máximo 1x por roteiro, não é obrigatório. Campos: "calendarMonth" (ex:
  "MARÇO", maiúsculo), "calendarDay" (ex: "15"), "calendarWeekday" (opcional, ex:
  "SEXTA-FEIRA"), "calendarNote" (legenda curta abaixo, ex: "DIA DO PAGAMENTO") — tem que bater
  com a data/evento citado na narração, nunca invente uma data diferente
- "clock" é um relógio digital ou analógico (em vez de foto) — use quando o roteiro menciona um
  HORÁRIO específico ou a passagem de um tempo do dia (ex: "às 7 da manhã", "antes de dormir",
  "2 minutos"), no máximo 1x por roteiro, não é obrigatório. Campos: "clockType" ("digital" ou
  "analog", padrão "digital"), "clockTime" (formato "HH:MM", ex: "07:30"), "clockNote"
  (legenda curta abaixo, opcional) — o horário tem que bater com o que a narração diz
- "moneystack" é uma pilha de notas de dinheiro crescendo, com contador subindo até o valor
  final (em vez de foto) — use quando o roteiro fala de dinheiro/patrimônio/economia
  CRESCENDO ou se ACUMULANDO de forma concreta/literal (diferente de "growth", que é uma
  linha de gráfico abstrata), no máximo 1x por roteiro, não é obrigatório. Campos:
  "moneyValue" (valor final no formato "R$ 1.247", tem que bater com o número citado na
  narração, nunca invente), "moneyNote" (legenda curta abaixo, ex: "em 6 meses"),
  "moneyBills" (opcional, número de notas na pilha, entre 3 e 8, padrão 6)
- "checklist" é um card com itens marcando check (✓) em sequência, no estilo native-ui (em
  vez de foto) — diferente de "list" (que é só texto com emoji, sem card/check): use
  "checklist" quando o roteiro descreve um PASSO A PASSO ou lista de ações concretas pra
  fazer (ex: "antes de investir, faça isso", "checklist de 3 passos"), no máximo 1x por
  roteiro, não é obrigatório. Campos: "checklistTitle" (opcional, título curto do card),
  "checklistItems" (lista de 3-5 strings curtas, cada uma um passo/ação)
- "progress" é um anel de progresso enchendo até uma porcentagem, com contador no centro
  (em vez de foto) — use quando o roteiro cita uma META, PERCENTUAL ou PROGRESSO em direção
  a algo (ex: "73% das pessoas erram isso", "você já fez metade do caminho"), no máximo 1x
  por roteiro, não é obrigatório. Campos: "progressPct" (número 0-100, tem que bater com o
  que a narração diz), "progressLabel" (opcional, texto curto acima do anel), "progressNote"
  (legenda curta abaixo, ex: "DAS PESSOAS NÃO FAZEM ISSO")
- "timer" é um cronômetro regressivo com anel se esvaziando, com os dígitos contando (em vez
  de foto) — use quando o roteiro menciona um tempo/prazo CURTO e concreto para fazer algo
  (ex: "separe 10 minutos", "em 30 segundos", "2 minutos por dia"), diferente de "clock" (que
  mostra um horário do dia, não uma duração), no máximo 1x por roteiro, não é obrigatório.
  Campos: "timerFrom" (formato "MM:SS", valor inicial, ex: "10:00"), "timerTo" (opcional,
  formato "MM:SS", padrão "0:00"), "timerLabel" (opcional, texto curto acima do anel),
  "timerNote" (legenda curta abaixo) — o tempo tem que bater com o que a narração diz
- "rating" é 5 estrelas pipocando em sequência revelando uma nota (em vez de foto) — use
  quando o roteiro cita uma NOTA, AVALIAÇÃO ou APROVAÇÃO concreta (ex: "nota 4.8",
  "a maioria aprova isso", "melhor avaliado"), no máximo 1x por roteiro, não é obrigatório.
  Campos: "ratingValue" (número 0-5, decimais permitidos, ex: 4.8, tem que bater com o que
  a narração diz), "ratingLabel" (opcional, texto curto acima das estrelas), "ratingNote"
  (legenda curta abaixo, ex: "MAIS DE 10 MIL AVALIAÇÕES")
- "scale" é uma balança de dois pratos pendendo pro lado vencedor (em vez de foto) — use
  quando o roteiro faz uma COMPARAÇÃO direta entre duas opções (ex: "alugar ou financiar",
  "risco vs retorno", "opção A vs opção B"), no máximo 1x por roteiro, não é obrigatório.
  Campos: "scaleLabel" (opcional, texto curto acima), "scaleLeftLabel"/"scaleLeftValue"
  (nome e valor curto do prato esquerdo), "scaleRightLabel"/"scaleRightValue" (idem direito),
  "scaleWinner" ("left" ou "right" — lado que pende, tem que bater com o que a narração
  diz ser a melhor opção), "scaleNote" (legenda curta abaixo) — valores têm que vir da
  narração, nunca invente
- "map" é um mapa estilizado (grade de pontos) com um pin caindo e radar pulsando (em vez
  de foto) — use quando o roteiro menciona um LOCAL ou abrangência geográfica (ex: "em
  qualquer lugar do Brasil", "perto de você", "não importa a cidade"), no máximo 1x por
  roteiro, não é obrigatório. Campos: "mapLabel" (opcional, texto curto acima), "mapPinLabel"
  (opcional, texto curto sob o pin, ex: "SÃO PAULO" — só use se o roteiro citar um lugar
  específico, senão deixe vazio), "mapNote" (legenda curta abaixo)
- "weather" é um ícone de clima animado (sol, nublado ou chuva) — use quando o roteiro usa
  uma METÁFORA de clima/tempo (ex: "nem todo dia é dia de sol", "se prepare pra qualquer
  cenário", "dias bons e ruins"), no máximo 1x por roteiro, não é obrigatório. Campos:
  "weatherType" ("sunny", "cloudy" ou "rainy" — escolha o que combina com a metáfora),
  "weatherTemp" (opcional, ex: "28°", só use se a narração citar temperatura),
  "weatherLabel" (opcional, texto curto acima), "weatherNote" (legenda curta abaixo)
- "achievement" é um badge/medalha pipocando com burst e fitas (em vez de foto) — use
  quando o roteiro cita uma META BATIDA, MARCO ou CONQUISTA desbloqueada (ex: "primeiro
  mil guardado", "meta do mês batida"), no máximo 1x por roteiro, não é obrigatório.
  Campos: "achievementLabel" (opcional, texto curto acima do badge), "achievementTitle"
  (texto curto dentro/abaixo do badge, ex: "PRIMEIRO MIL", tem que bater com a narração),
  "achievementNote" (legenda curta abaixo)
- "battery" é uma bateria enchendo de baixo pra cima com contador de porcentagem (em vez
  de foto) — use quando o roteiro fala de energia/reserva/força se ACUMULANDO AOS POUCOS
  de forma literal (diferente de "progress", que é um anel mais abstrato para metas/
  percentuais gerais), no máximo 1x por roteiro, não é obrigatório. Campos: "batteryPct"
  (número 0-100, tem que bater com o que a narração diz), "batteryLabel" (opcional, texto
  curto acima), "batteryNote" (legenda curta abaixo)
- "book" é um livro fechado que abre revelando um título na página (em vez de foto) — use
  quando o roteiro fala de APRENDIZADO ou EDUCAÇÃO sobre o tema (ex: "estude antes de
  investir", "conhecimento é a base de tudo"), no máximo 1x por roteiro, não é obrigatório.
  Campos: "bookTitle" (título curto na página, ex: "EDUCAÇÃO FINANCEIRA"), "bookLabel"
  (opcional, texto curto acima do livro), "bookNote" (legenda curta abaixo)
- "thermometer" é um termômetro enchendo de baixo pra cima (em vez de foto) — use quando o
  roteiro cita um NÍVEL ou INTENSIDADE (ex: "nível de risco desse investimento", "quanto
  falta pra bater sua meta"), diferente de "battery" (energia/reserva se acumulando) e
  "progress" (meta/percentual geral), no máximo 1x por roteiro, não é obrigatório. Campos:
  "thermoPct" (número 0-100, tem que bater com a narração), "thermoLabel" (opcional, texto
  curto acima), "thermoNote" (legenda curta abaixo)
- "piggybank" é moedas caindo uma a uma num pote até formar um valor (em vez de foto) — use
  quando o roteiro fala de ECONOMIZAR/GUARDAR dinheiro pouco a pouco, de forma mais literal
  que "moneystack" (que empilha notas), no máximo 1x por roteiro, não é obrigatório. Campos:
  "piggyValue" (valor final, ex: "R$ 500", tem que bater com a narração), "piggyLabel"
  (opcional, texto curto acima), "piggyNote" (legenda curta abaixo, ex: "em 3 meses"),
  "piggyCoins" (opcional, número de moedas entre 4 e 8, padrão 5)
- "receipt" é um recibo com itens somando um total em destaque (em vez de foto) — use
  quando o roteiro DETALHA gastos/itens que compõem um valor (ex: "pra onde vai seu
  salário"), diferente de "proof" (barras de %), no máximo 1x por roteiro, não é
  obrigatório. Campos: "receiptTitle" (opcional, título curto), "receiptItems" (lista de
  3-5 {"label": string, "value": string}, valores têm que vir da narração), "receiptTotal"
  (valor total, destacado, tem que ser a soma dos itens), "receiptNote" (legenda abaixo)
- "roadmap" é uma linha do tempo horizontal com 3-4 marcos acendendo em sequência (em vez
  de foto) — use para uma JORNADA ou PLANO em etapas (ex: "sua reserva em 3 passos"),
  diferente de "checklist" (tarefas marcando check), no máximo 1x por roteiro, não é
  obrigatório. Campos: "roadmapTitle" (opcional, título curto), "roadmapSteps" (lista de
  3-4 {"label": string}, cada uma uma etapa curta), "roadmapNote" (legenda abaixo)
- "quote" é uma citação editorial com aspas grandes (em vez de foto) — use quando o roteiro
  cita uma frase de autoridade real ou dado curto pra reforçar o argumento, no máximo 1x
  por roteiro, não é obrigatório. NUNCA invente uma citação falsa atribuída a uma pessoa
  real — use só frases verdadeiras e conhecidas, ou deixe "quoteAuthor" vazio se for uma
  frase de efeito sem autoria. Campos: "quoteText" (a frase, sem aspas), "quoteAuthor"
  (opcional, ex: "Warren Buffett")
- "alert" é um triângulo de alerta pulsando em vermelho (em vez de foto) — use quando o
  roteiro aponta um ERRO COMUM ou RISCO a evitar (ex: "cuidado com esse erro"), tom de
  advertência, no máximo 1x por roteiro, não é obrigatório. Campos: "alertLabel" (opcional,
  ex: "ATENÇÃO"), "alertTitle" (a mensagem de alerta principal), "alertNote" (legenda
  abaixo)
- "split" é dois valores lado a lado com divisória central (em vez de foto) — use para
  comparar dois ESTADOS/MOMENTOS (ex: "antes e depois da reserva") sem indicar vencedor,
  diferente de "scale" (que pende pra um lado), no máximo 1x por roteiro, não é
  obrigatório. Campos: "splitLabel" (opcional, texto curto acima), "splitLeftLabel"/
  "splitLeftValue" (nome e valor curto do lado esquerdo), "splitRightLabel"/
  "splitRightValue" (idem direito, sempre o lado em destaque), "splitNote" (legenda abaixo)
- "counter" é um número gigante contando até um valor, sem ícone (em vez de foto) — use
  pra uma ESTATÍSTICA de impacto pura (ex: "87% das pessoas", "+10 mil investidores"),
  quando o dado em si já é o choque, no máximo 1x por roteiro, não é obrigatório. Campos:
  "counterTo" (número final, tem que bater com a narração), "counterPrefix"/"counterSuffix"
  (opcionais, ex: "+" / "%"), "counterLabel" (opcional, texto curto acima), "counterNote"
  (legenda abaixo)
- "sizecompare" é dois elementos lado a lado em escalas muito diferentes, com zoom-out
  revelando a diferença (em vez de foto) — use pra um fato de ESCALA/TAMANHO impressionante
  (ex: comparar o tamanho de dois objetos, animais, prédios, planetas), no máximo 1x por
  roteiro, não é obrigatório. Campos: "sizeLabel" (opcional), "sizeLeftLabel"/
  "sizeLeftValue", "sizeRightLabel"/"sizeRightValue" (o lado direito é sempre o maior),
  "sizeRatio" (opcional, número de quantas vezes o direito é maior, tem que bater com a
  narração), "sizeNote"
- "xray" é um scanner que passa sobre um ícone revelando uma camada "interna" diferente
  (em vez de foto) — use pra explicar COMO ALGO FUNCIONA POR DENTRO, no máximo 1x por
  roteiro, não é obrigatório. Campos: "xrayLabel" (opcional), "xrayOutside" (rótulo do
  lado não escaneado), "xrayInside" (rótulo do lado revelado), "xrayNote"
- "proportiongrid" é uma grade de ícones onde só uma fração acende (em vez de foto) — use
  pra uma proporção/estatística do tipo "X em cada Y" (ex: "apenas 3 em cada 100 pessoas"),
  no máximo 1x por roteiro, não é obrigatório. Campos: "gridLabel" (opcional), "gridTotal"
  (opcional, padrão 100), "gridHighlight" (quantos acendem, tem que bater com a narração),
  "gridNote"
- "speedrace" é 2-3 barras cruzando a tela em velocidades diferentes (em vez de foto) —
  use pra comparar a RAPIDEZ de coisas distintas (ex: "som viaja mais rápido que..."), no
  máximo 1x por roteiro, não é obrigatório. Campos: "raceLabel" (opcional), "raceItems"
  (lista de 2-3 {"label": string, "value": string opcional, "speed": número, maior =
  mais rápido}), "raceNote"
- "timelineera" é uma régua temporal deslizando rápido até parar numa data específica
  (em vez de foto) — diferente de "roadmap" (que são passos de um plano, não anos): use
  "timelineera" quando o roteiro cita um ANO ou PERÍODO HISTÓRICO concreto, no máximo 1x
  por roteiro, não é obrigatório. Campos: "eraLabel" (opcional), "eraFrom" (opcional, ano
  inicial da régua), "eraTo" (ano onde a régua para, tem que bater com a narração), "eraNote"
- "orbit" é um núcleo central com 2-3 elementos orbitando ao redor (em vez de foto) — use
  pra conceitos CENTRAIS com coisas girando em torno (planetas, átomo, ideias que giram em
  torno de um tema central), no máximo 1x por roteiro, não é obrigatório. Campos:
  "orbitLabel" (opcional), "orbitCenterLabel" (texto curto no núcleo), "orbitItems" (lista
  de 2-3 {"label": string}), "orbitNote"
- "dna" é uma hélice dupla estilizada girando suavemente (em vez de foto) — curinga visual
  pra curiosidades de biologia, saúde, genética ou evolução, sem dado numérico, no máximo
  1x por roteiro, não é obrigatório. Campos: "dnaLabel" (opcional), "dnaNote" (opcional)
- "mythfact" é uma afirmação que recebe um carimbo "FALSO" e vira revelando a verdade em
  verde (em vez de foto) — use pra DESMENTIR um mito/crença popular comum sobre o tema, no
  máximo 1x por roteiro, não é obrigatório. NUNCA invente um mito ou verdade falsa — só use
  se o roteiro já citar essa desconstrução. Campos: "mythLabel" (o mito/afirmação falsa),
  "factLabel" (a verdade), "mythNote" (opcional)
- "redacted" é um documento com tarja preta que desliza revelando uma palavra escondida
  (em vez de foto) — use pra um dado pouco conhecido/"segredo" sobre o tema, no máximo 1x
  por roteiro, não é obrigatório. Campos: "redactedTitle" (ex: "ARQUIVO CONFIDENCIAL"),
  "redactedWord" (a palavra revelada, tem que bater com a narração), "redactedNote"
- "magnify" é uma lupa que passeia pela tela até focar e ampliar um detalhe escondido (em
  vez de foto) — use pra revelar um detalhe pouco notado sobre o tema, no máximo 1x por
  roteiro, não é obrigatório. Campos: "magnifyLabel" (opcional), "magnifyTitle" (o detalhe
  revelado), "magnifyNote"
- "censored" é um texto/valor que começa borrado e fica nítido (em vez de foto) — use pra
  criar suspense antes de revelar um número ou fato chocante, no máximo 1x por roteiro,
  não é obrigatório. Campos: "censoredLabel" (opcional), "censoredText" (o texto/valor
  revelado), "censoredNote"
- "domino" é uma fileira de blocos que tombam em cadeia (em vez de foto) — use pra
  ilustrar causa-e-efeito, um evento pequeno causando uma consequência grande, no máximo
  1x por roteiro, não é obrigatório. Campos: "dominoLabel" (opcional), "dominoCount"
  (opcional, padrão 6), "dominoNote"
- "treebranch" é uma linha que sobe e se bifurca em vários ramos (em vez de foto) — use
  pra mostrar como uma coisa deu origem a várias outras (uma língua, espécie, invenção),
  no máximo 1x por roteiro, não é obrigatório. Campos: "treeLabel" (opcional),
  "treeRootLabel" (nó raiz), "treeBranches" (lista de 2-4 {"label": string}), "treeNote"
- "vsbattle" é duas metades colidindo na diagonal com um emblema "VS" pulsante (em vez de
  foto) — diferente de "split" (comparação passiva lado a lado sem confronto): use
  "vsbattle" quando o roteiro faz um CONFRONTO direto entre dois animais, países ou
  fenômenos, no máximo 1x por roteiro, não é obrigatório. Campos: "vsLeftLabel"/
  "vsLeftValue", "vsRightLabel"/"vsRightValue", "vsNote"
- De 10 a 12 cenas (nunca menos de 10), sempre inclua intro e outro
- Textos visuais em MAIÚSCULAS

REGRAS DE NARRAÇÃO:
- Cada cena tem um campo "narration" com o texto falado em português natural
- A narração deve ser fluida, como se estivesse conversando
- NÃO use maiúsculas na narração, ela é falada não lida
- A duração da cena deve ser compatível com o tempo de fala (~3 palavras/segundo);
  calcule: número de palavras ÷ 3, arredonde para cima
- A cena "intro" SEMPRE tem narração (nunca ""): é o gancho falado que tem que começar
  junto com o vídeo, não só o texto na tela — o vídeo não pode abrir em silêncio.
  "outro" pode ter narração curta (ex: convite pra seguir/comentar) ou vazia só se o
  CTA na tela já for autoexplicativo
- Use pontuação natural de fala (!, reticências) pra variar a entonação — frases que só
  terminam em ponto final soam mais monótonas na narração
- O vídeo completo deve somar entre 55 e 70 segundos de narração — antes de responder, SOME
  a duração de todas as cenas; se o total ficar abaixo de 55s, aprofunde alguma narração ou
  adicione mais uma cena até chegar nesse total
- PROFUNDIDADE OBRIGATÓRIA: o roteiro deve realmente ensinar, mostrar ou revelar algo
  concreto sobre o tema. Evite generalidades — use fatos, números, exemplos específicos e
  explique o MECANISMO por trás do que está sendo dito. Adapte o nível de detalhe ao nicho:
  receita culinária → ingredientes e técnica real; produtividade → método com passos concretos;
  saúde → dado científico ou fisiológico; história → fato verificável com data e nome
- Cada cena deve avançar o raciocínio — nunca repita a mesma ideia em palavras diferentes.
  Use a estrutura: gancho → problema ou curiosidade concreta → causa ou mecanismo real →
  solução ou revelação específica → exemplo ou dado que prova o ponto → chamada para ação
- Evite frases genéricas como "isso vai mudar sua vida", "você precisa saber disso" ou
  "a maioria das pessoas não sabe". Substitua por fatos ou exemplos que provem o ponto

REGRAS DE IMAGENS (para geração via IA / busca no Pixabay):
- Gere também um campo "imagePrompts": uma lista com EXATAMENTE um item para cada cena de
  "scenes", NA MESMA ORDEM — imagePrompts[0] ilustra a cena 0, imagePrompts[1] a cena 1, etc.
  Antes de responder, CONTE o número de cenas em "scenes" e confirme que "imagePrompts" tem
  o mesmo número de itens — nem um a mais, nem um a menos
- Cada prompt deve ilustrar especificamente o CONTEÚDO DAQUELA CENA (o que a narration/title/
  text dela diz), não o tema genérico do vídeo inteiro
- NÃO inclua texto, palavras, números ou letras nos prompts (Stable Diffusion não renderiza texto bem)
- Escreva os prompts em INGLÊS (bancos de imagem como Pixabay indexam tags em inglês)
- Descreva uma cena LITERAL e concreta (objeto/pessoa/ação visível), nunca uma metáfora ou
  símbolo ("fading banknotes to symbolize loss", "door symbolizing a solution") — busca de banco
  de imagens casa por palavra-chave, não entende metáfora
- Estilo sugerido ao final de cada prompt: "cinematic photography, warm natural lighting, shallow depth of field, realistic, instagram aesthetic, vertical composition"

FORMATO JSON (retorne APENAS o JSON, sem markdown — o exemplo abaixo tem só 4 cenas pra caber
aqui; a saída real tem que ter de 9 a 12 cenas, intercalando os tipos acima conforme as regras):
{
  "title": "título do vídeo",
  "accentColor": "#FFD700",
  "caption": "legenda completa para o Instagram com emojis e hashtags",
  "imagePrompts": ["prompt cena 0", "prompt cena 1", "...um por cena, na ordem"],
  "scenes": [
    {
      "type": "intro",
      "duration": 3,
      "channel": "VinyBruno.ia",
      "title": "TÍTULO IMPACTANTE",
      "subtitle": "subtítulo explicativo",
      "narration": "narração do gancho aqui, já começando a falar desde o frame zero."
    },
    {
      "type": "highlight",
      "duration": 5,
      "text": "afirmação ou pergunta *destacada*",
      "narration": "narração da cena aqui."
    },
    {
      "type": "card",
      "duration": 6,
      "cardTitle": "RÓTULO",
      "cardValue": "VALOR OU RESULTADO",
      "cardNote": "contexto em *amarelo*",
      "narration": "narração da cena aqui."
    },
    {
      "type": "outro",
      "duration": 3,
      "channel": "VinyBruno.ia",
      "title": "CURTIU? SEGUE AÍ!",
      "cta": "▶ Seguir",
      "narration": "se isso te ajudou, segue aqui pra não perder o próximo."
    }
  ]
}"""

# ── Gemini (endpoint nativo) ──────────────────────────────────────────────────
def gerar_roteiro(tema: str) -> dict:
    print(f"\n🤖 Gerando roteiro via Gemini ({GEMINI_MODEL}): '{tema}'...")

    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY não encontrada no .env")
        sys.exit(1)

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"Crie um roteiro sobre: {tema}"}]},
        ],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        # 9-12 cenas + narração mais profunda + 1 imagePrompt/cena passam fácil de 2000
        # tokens — já vimos JSON truncado/invalido nesse limite com roteiro bem mais curto
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": 4096},
    }

    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
    }
    url = GEMINI_URL.format(model=GEMINI_MODEL)

    # Retry automático em 503 e timeout
    r = None
    for tentativa in range(1, 4):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=90)
        except requests.exceptions.Timeout:
            espera = tentativa * 10
            print(f"   ⏳ Timeout ({tentativa}/3), tentando novamente em {espera}s...")
            time.sleep(espera)
            continue
        if r.status_code == 503:
            espera = tentativa * 10
            print(f"   ⏳ Servidor ocupado ({tentativa}/3), tentando novamente em {espera}s...")
            time.sleep(espera)
            continue
        break
    if r is None:
        print("❌ Gemini API: sem resposta após 3 tentativas")
        sys.exit(1)

    if not r.ok:
        print(f"❌ Gemini API erro {r.status_code}: {r.text[:400]}")
        r.raise_for_status()

    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    script = json.loads(raw)
    script = _limpar_markdown_fora_de_escopo(script)
    script["accentColor"] = ACCENT_COLOR

    for scene in script.get("scenes", []):
        if scene.get("type") in ("intro", "outro") and not scene.get("channel"):
            scene["channel"] = CHANNEL_NAME

    print(f"✅ Roteiro: {len(script['scenes'])} cenas")
    return script


_MARKDOWN_CAMPOS_PERMITIDOS = {"text", "cardNote", "items"}  # únicos campos que o Remotion
# renderiza via parseText()/splitHighlightWords() (ver src/utils/text.tsx) — qualquer outro
# campo (narration, títulos, notes dos ~20 tipos de cena sem foto) mostra a string crua na
# tela, então "*destaque*"/"**branco**" vazaria como asterisco literal em vez de formatação.


def _limpar_markdown_fora_de_escopo(valor, campo=None):
    if isinstance(valor, str):
        if campo in _MARKDOWN_CAMPOS_PERMITIDOS or "*" not in valor:
            return valor
        return valor.replace("**", "").replace("*", "")
    if isinstance(valor, list):
        return [_limpar_markdown_fora_de_escopo(v, campo) for v in valor]
    if isinstance(valor, dict):
        return {k: _limpar_markdown_fora_de_escopo(v, k) for k, v in valor.items()}
    return valor


def _prompts_fallback(script: dict, tema: str, n: int) -> list:
    """Monta 1 prompt de imagem por cena (a partir do próprio título/texto dela) quando
    o Gemini não retorna imagePrompts — mantém o alinhamento 1 prompt = 1 cena."""
    prompts = []
    for scene in script.get("scenes", []):
        label = scene.get("title") or scene.get("text") or scene.get("cardTitle") or tema
        prompts.append(label.lower())
    if len(prompts) < n:
        prompts = prompts + [tema] * (n - len(prompts))
    return prompts[:n]


# ── XTTS v2 (Coqui TTS) ───────────────────────────────────────────────────────
_xtts_model = None


def _xtts_device() -> str:
    try:
        import torch
        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        return "cpu"


def _get_xtts_model() -> "TTS":
    global _xtts_model
    if _xtts_model is None:
        print(f"   Carregando modelo XTTS v2 ({XTTS_MODEL})...")
        _xtts_model = TTS(XTTS_MODEL).to(_xtts_device())
    return _xtts_model


def _descarregar_xtts_model() -> None:
    """Libera o modelo XTTS (torch) da RAM antes do Remotion abrir Chromium — em
    máquina com pouca RAM, os dois ao mesmo tempo estourava memória e o kernel
    matava o processo (SIGKILL / código -9 no post_reel.py)."""
    global _xtts_model
    if _xtts_model is None:
        return
    _xtts_model = None
    gc.collect()
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:
        pass


def _palavras_fallback(texto: str, offset: float, duracao: float) -> list:
    """Estima o timing de cada palavra dividindo a duração proporcionalmente
    pelo nº de caracteres — usado porque o XTTS v2 (diferente do Kokoro) não
    expõe um duration predictor (pred_dur) com timing real por fonema."""
    palavras = texto.split()
    if not palavras:
        return []
    total_chars = sum(len(w) for w in palavras) or 1
    t = offset
    out = []
    for w in palavras:
        d = duracao * (len(w) / total_chars)
        out.append({"text": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
_SILENCIO_ENTRE_FRASES = 0.25  # segundos de pausa entre frases concatenadas


def _preparar_frases_tts(texto: str) -> list:
    """Divide a narração em frases e remove o "." de cada uma.

    O XTTS v2 tem um bug conhecido e sem correção oficial no fork Coqui
    (coqui-ai/TTS#2952, #3598): a voz em português às vezes fala a palavra
    "ponto" em vez de só pausar quando o texto contém ".", principalmente em
    frases longas — mesmo quando o texto já chega como uma frase só (o que
    split_sentences=True do TTS.api já faria por conta própria). Como a pausa
    real é garantida pelo silêncio inserido entre as frases concatenadas, o
    ponto final pode ser removido sem perda; "!" e "?" ficam, pois não
    disparam o bug.
    """
    frases = [f.strip() for f in _SENTENCE_SPLIT_RE.split(texto.strip()) if f.strip()]
    saida = []
    for frase in frases:
        # Remove marcações de destaque (*texto*/**texto**) que às vezes vazam da
        # narração — são só pra legenda/texto na tela; o XTTS não deve "falar" o símbolo.
        frase = frase.replace("*", "")
        frase = frase.replace("...", ",").replace(". ", ", ")
        if frase.endswith("."):
            frase = frase[:-1].strip()
        if frase:
            saida.append(frase)
    return saida or [texto.strip()]


def _gerar_audio_xtts(texto: str, caminho: Path) -> list:
    model = _get_xtts_model()
    frases = _preparar_frases_tts(texto)

    sample_rate = 24000
    pedacos = []
    palavras = []
    t = 0.0
    for i, frase in enumerate(frases):
        tmp_path = caminho.with_name(f"{caminho.stem}_tmp{i}.wav")
        kwargs = {
            "text": frase,
            "language": XTTS_LANGUAGE,
            "file_path": str(tmp_path),
            "split_sentences": False,
            "temperature": XTTS_TEMPERATURE,
            "repetition_penalty": XTTS_REPETITION_PENALTY,
            "speed": XTTS_SPEED,
        }
        if XTTS_SPEAKER_WAV:
            kwargs["speaker_wav"] = XTTS_SPEAKER_WAV
        else:
            kwargs["speaker"] = XTTS_SPEAKER
        model.tts_to_file(**kwargs)

        audio, sample_rate = sf.read(str(tmp_path))
        pedacos.append(audio)
        tmp_path.unlink(missing_ok=True)

        # Timing por palavra no offset real desta frase — calcular sobre o
        # texto inteiro de uma vez (como antes) borraria as pausas entre
        # frases ao longo de todas as palavras, atrasando a legenda cada vez
        # mais conforme a narração avança (mais visível agora que XTTS_SPEED
        # subiu: a pausa fixa de 0.25s passou a pesar mais no total).
        dur_frase = len(audio) / sample_rate if sample_rate else 0.0
        palavras += _palavras_fallback(frase, t, dur_frase)
        t += dur_frase
        if i < len(frases) - 1:
            t += _SILENCIO_ENTRE_FRASES

    if len(pedacos) > 1:
        gap = np.zeros(int(_SILENCIO_ENTRE_FRASES * sample_rate))
        partes = []
        for i, pedaco in enumerate(pedacos):
            partes.append(pedaco)
            if i < len(pedacos) - 1:
                partes.append(gap)
        audio_final = np.concatenate(partes)
    else:
        audio_final = pedacos[0]

    sf.write(str(caminho), audio_final, sample_rate)
    _normalizar_volume(caminho)

    return palavras


def _normalizar_volume(caminho: Path) -> None:
    """Normaliza o volume (EBU R128) para ficar consistente entre cenas/vídeos.

    loudnorm reamostra a saída (ex: 192kHz) por padrão — força -ar de volta
    para a taxa original para não dessincronizar do resto do pipeline (24kHz)."""
    tmp = caminho.with_suffix(".norm.wav")
    try:
        taxa = sf.info(str(caminho)).samplerate
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(caminho), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-ar", str(taxa), str(tmp)],
            capture_output=True, check=True, timeout=30,
        )
        tmp.replace(caminho)
    except Exception as e:
        print(f"   ⚠️  loudnorm falhou, mantendo áudio sem normalização: {e}")
        tmp.unlink(missing_ok=True)


def gerar_audios(script: dict, audio_dir: Path) -> tuple:
    """Gera um .wav por cena (XTTS v2) e salva o caminho absoluto em scene['_audio_path'].

    IMPORTANTE: NÃO define scene['audio'] — esse campo é lido pelo Remotion
    como URL (http://localhost:3000/...) e causaria erros 404 no bundle.
    O mix com ffmpeg usa '_audio_path' diretamente após o render mudo.

    Retorna (script, qa) — qa junta os checks automáticos (silêncio/clipping/duração/
    markdown) usados pelo histórico de gerações em .historico_geracoes.json.
    """
    audio_dir.mkdir(parents=True, exist_ok=True)
    voz = f"speaker_wav='{XTTS_SPEAKER_WAV}'" if XTTS_SPEAKER_WAV else f"speaker='{XTTS_SPEAKER}'"
    print(f"\n🎙️  Gerando narração com XTTS v2 ({voz}, language='{XTTS_LANGUAGE}')...")

    qa = {"audio_silence": False, "audio_clipping": False,
          "duration_mismatch": False, "duration_mismatch_max_ratio": 1.0}

    for i, scene in enumerate(script["scenes"]):
        narration = scene.pop("narration", "").strip()
        if not narration:
            continue

        audio_path = audio_dir / f"cena_{i:02d}.wav"
        print(f"   [{i+1}] {scene['type']:10} → {narration[:50]}{'...' if len(narration) > 50 else ''}")

        palavras = _gerar_audio_xtts(narration, audio_path)

        # Mede duração real do áudio gerado
        try:
            r = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
                capture_output=True, text=True, timeout=10,
            )
            real_dur = float(r.stdout.strip())
        except Exception:
            real_dur = scene.get("duration", 3)

        niveis = _qa_audio_niveis(audio_path)
        qa["audio_silence"]  = qa["audio_silence"]  or niveis["silence"]
        qa["audio_clipping"] = qa["audio_clipping"] or niveis["clipping"]

        planned = scene.get("duration") or 3
        ratio = real_dur / planned if planned else 1.0
        if ratio < 0.5 or ratio > 2.0:
            qa["duration_mismatch"] = True
        desvio = max(ratio, 1 / ratio) if ratio else 1.0
        qa["duration_mismatch_max_ratio"] = max(qa["duration_mismatch_max_ratio"], desvio)

        # Campos privados (não vão pro Remotion diretamente)
        scene["_audio_path"]     = str(audio_path)
        scene["_audio_duration"] = real_dur   # duração real em segundos
        # Guarda texto, duração real e timing por palavra (efeito karaokê) para a legenda
        scene["_caption"]        = narration
        scene["_words"]          = palavras

    qa["caption_markdown_leak"] = _qa_caption_tem_asterisco(script)
    if qa["caption_markdown_leak"]:
        print("   ⚠️  Aviso: asterisco de markdown vazou pra narração/legenda de alguma cena")

    print("✅ Áudios gerados")
    return script, qa


# ── ComfyUI (SD 1.5) + fallback Pixabay ──────────────────────────────────────
def _comfyui_disponivel() -> bool:
    try:
        r = requests.get(f"{COMFYUI_URL}/system_stats", timeout=3)
        return r.ok
    except Exception:
        return False


def _iniciar_comfyui() -> "subprocess.Popen | None":
    """Sobe o ComfyUI em background se ainda não estiver rodando em COMFYUI_URL.
    Retorna o processo (para ser encerrado depois) ou None se já estava rodando
    (não é nosso para derrubar) ou se não deu para subir — nesses casos o fluxo
    segue e cai no fallback Pixabay."""
    if _comfyui_disponivel():
        print(f"\n🖼️  ComfyUI já está rodando em {COMFYUI_URL}")
        return None

    main_py = COMFYUI_DIR / "main.py"
    if not main_py.exists():
        print(f"\n🖼️  ComfyUI não encontrado em {COMFYUI_DIR} — usando Pixabay")
        return None

    print(f"\n🚀 Iniciando ComfyUI em background ({COMFYUI_DIR})...")
    proc = subprocess.Popen(
        [sys.executable, "main.py", "--lowvram"],
        cwd=str(COMFYUI_DIR),
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    deadline = time.time() + COMFYUI_AUTOSTART_TIMEOUT
    while time.time() < deadline:
        if _comfyui_disponivel():
            print("   ✅ ComfyUI pronto")
            return proc
        if proc.poll() is not None:
            print("   ❌ ComfyUI encerrou antes de ficar pronto — usando Pixabay")
            return None
        time.sleep(2)

    print(f"   ⚠️  ComfyUI não respondeu em {COMFYUI_AUTOSTART_TIMEOUT}s — usando Pixabay e encerrando-o")
    proc.terminate()
    return None


def _parar_comfyui(proc: "subprocess.Popen | None") -> None:
    """Encerra o ComfyUI, mas só se fomos nós que subimos o processo."""
    if proc is None or proc.poll() is not None:
        return
    print("\n🛑 Encerrando ComfyUI...")
    proc.terminate()
    try:
        proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        proc.kill()


def _comfyui_workflow(prompt: str, seed: int) -> dict:
    negativo = ("texto, palavras, letras, números, marca d'água, baixa qualidade, "
                "deformado, borrado, membros extras, mal desenhado, assinatura")
    return {
        "3": {"class_type": "KSampler", "inputs": {
            "seed": seed, "steps": COMFYUI_STEPS, "cfg": 7.0,
            "sampler_name": "euler", "scheduler": "normal", "denoise": 1.0,
            "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0],
        }},
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": COMFYUI_CHECKPOINT}},
        "5": {"class_type": "EmptyLatentImage", "inputs": {
            "width": COMFYUI_WIDTH, "height": COMFYUI_HEIGHT, "batch_size": 1,
        }},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["4", 1]}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"text": negativo, "clip": ["4", 1]}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
        "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "reel", "images": ["8", 0]}},
    }


def _comfyui_gerar_uma(prompt: str, dest: Path, client_id: str) -> bool:
    seed = random.randint(0, 2**32 - 1)
    workflow = _comfyui_workflow(prompt, seed)

    try:
        r = requests.post(
            f"{COMFYUI_URL}/prompt",
            json={"prompt": workflow, "client_id": client_id},
            timeout=15,
        )
        if not r.ok:
            print(f"      ❌ ComfyUI /prompt erro {r.status_code}: {r.text[:200]}")
            return False
        prompt_id = r.json().get("prompt_id")
        if not prompt_id:
            return False
    except Exception as e:
        print(f"      ❌ Erro ao enviar prompt ao ComfyUI: {e}")
        return False

    # Poll em /history até a imagem ficar pronta (timeout ~90s)
    for _ in range(90):
        time.sleep(1)
        try:
            h = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=10)
        except Exception:
            continue
        if not h.ok:
            continue
        data = h.json().get(prompt_id)
        if not data:
            continue
        imagens = data.get("outputs", {}).get("9", {}).get("images", [])
        if imagens:
            img = imagens[0]
            params = {
                "filename": img["filename"],
                "subfolder": img.get("subfolder", ""),
                "type": img.get("type", "output"),
            }
            img_r = requests.get(f"{COMFYUI_URL}/view", params=params, timeout=30)
            if img_r.ok:
                dest.write_bytes(img_r.content)
                return True
            return False

    print("      ❌ Timeout esperando o ComfyUI gerar a imagem")
    return False


def _pixabay_buscar(endpoint: str, query: str, extra_params: dict) -> list:
    try:
        r = requests.get(f"https://pixabay.com/api/{endpoint}", params={
            "key": PIXABAY_KEY, "q": query, "order": "relevance", "safesearch": "true",
            "per_page": 20, **extra_params,
        }, timeout=15)
        return r.json().get("hits", []) if r.ok else []
    except Exception:
        return []


def _pixabay_fallback(prompts: list, tema: str, dest_dir: Path) -> list:
    print("   ↪️  ComfyUI indisponível — usando Pixabay como fallback de imagens/vídeos")
    if not PIXABAY_KEY:
        print("   ❌ PIXABAY_API_KEY não configurada — sem fallback de imagens")
        return []

    caminhos = []
    vistos = set()
    termos = prompts if prompts else [tema]

    for i, termo in enumerate(termos):
        query = termo.split(",")[0][:100] or tema
        # Busca com palavras-chave curtas (não a frase inteira) — a API do Pixabay casa
        # por keyword, e uma frase de 10+ palavras dilui o match e traz resultado genérico.
        # Pipeline é só pra conteúdo de finanças pessoais (ver CLAUDE.md) — "finance money"
        # no fim ancora a busca no tema mesmo quando as palavras-chave da cena são fracas
        # (verificado manualmente: sem a âncora, prompts como "coins stacking wooden table"
        # retornam maçã/livro/gato no topo; com ela, voltam moedas/dinheiro/gráfico).
        search_q = (_pixabay_keywords(query) or query) + " finance money"

        fotos = _pixabay_buscar("", search_q, {"image_type": "photo", "orientation": "vertical"})
        videos = _pixabay_buscar("videos/", search_q, {})

        # Foto e vídeo competem pelo mesmo score de relevância (_pixabay_relevancia) —
        # usa o que combinar melhor com o termo buscado, não importa o tipo.
        candidatos = (
            [("foto", h, _pixabay_relevancia(query, h.get("tags", ""))) for h in fotos if ("foto", h["id"]) not in vistos]
            + [("video", h, _pixabay_relevancia(query, h.get("tags", ""))) for h in videos if ("video", h["id"]) not in vistos]
        )
        if not candidatos:
            continue
        tipo, hit, score = max(candidatos, key=lambda c: c[2])
        vistos.add((tipo, hit["id"]))
        _ULTIMA_RELEVANCIA_PIXABAY.append(score)

        try:
            if tipo == "video":
                arquivos_video = hit.get("videos", {})
                video = arquivos_video.get("small") or arquivos_video.get("tiny") or arquivos_video.get("medium")
                if not video:
                    continue
                media_r = requests.get(video["url"], timeout=60)
                sufixo = ".mp4"
            else:
                media_r = requests.get(hit["largeImageURL"], timeout=30)
                sufixo = ".jpg"
        except Exception:
            continue
        if media_r.ok:
            caminho = dest_dir / f"img_{i:02d}{sufixo}"
            caminho.write_bytes(media_r.content)
            caminhos.append(caminho)

    return caminhos


def gerar_imagens(prompts: list, tema: str, dest_dir: Path, usar_ia: bool = False) -> list:
    """Gera imagens de fundo. Sem --ai-image (usar_ia=False): busca direto no Pixabay (padrão).
    Com --ai-image: tenta ComfyUI (SD 1.5 local) primeiro e cai para o Pixabay se indisponível/falhar."""
    dest_dir.mkdir(parents=True, exist_ok=True)

    if not usar_ia:
        return _pixabay_fallback(prompts, tema, dest_dir)

    if not _comfyui_disponivel():
        print(f"\n🖼️  ComfyUI não detectado em {COMFYUI_URL}")
        return _pixabay_fallback(prompts, tema, dest_dir)

    print(f"\n🖼️  Gerando {len(prompts)} imagens via ComfyUI (SD 1.5, {COMFYUI_WIDTH}x{COMFYUI_HEIGHT})...")
    client_id = str(uuid.uuid4())
    caminhos = []
    for i, prompt in enumerate(prompts):
        dest = dest_dir / f"img_{i:02d}.png"
        print(f"   [{i+1}/{len(prompts)}] {prompt[:60]}{'...' if len(prompt) > 60 else ''}")
        if _comfyui_gerar_uma(prompt, dest, client_id):
            caminhos.append(dest)
        else:
            print(f"      ⚠️  Falhou — pulando imagem {i+1}")

    if not caminhos:
        print("   ⚠️  Nenhuma imagem gerada pelo ComfyUI — tentando Pixabay")
        return _pixabay_fallback(prompts, tema, dest_dir)

    return caminhos


# Cenas de card/dado/branding (proof, card, intro, outro) ficam sem foto de propósito —
# renderizam sobre o gradiente limpo do Remotion, estilo editorial (motionmaxxing). Módulo
# usa o mesmo set em main() pra nem buscar/baixar imagem pras cenas que nunca vão exibi-la.
SCENE_TYPES_SEM_FOTO = {"proof", "growth", "card", "intro", "outro", "notification", "calendar", "clock", "moneystack", "checklist", "progress", "timer", "rating", "scale", "map", "weather", "achievement", "battery", "book", "thermometer", "piggybank", "receipt", "roadmap", "quote", "alert", "split", "counter", "sizecompare", "xray", "proportiongrid", "speedrace", "timelineera", "orbit", "dna", "mythfact", "redacted", "magnify", "censored", "domino", "treebranch", "vsbattle"}


def aplicar_imagens_de_fundo(script: dict, imagens: list) -> None:
    """Copia as imagens geradas para public/images/ e associa uma a cada cena elegível
    (cicla se houver menos imagens que cenas) para o Ken Burns no Remotion."""
    public_images_dir = SCRIPT_DIR / "public" / "images"
    if public_images_dir.exists():
        shutil.rmtree(public_images_dir)
    public_images_dir.mkdir(parents=True, exist_ok=True)

    nomes = []
    for i, origem in enumerate(imagens):
        destino = public_images_dir / f"{i:02d}{origem.suffix}"
        shutil.copy(origem, destino)
        nomes.append(destino.name)

    print(f"\n🎞️  {len(nomes)} imagem(ns) pronta(s) em public/images/ (Ken Burns automático)")
    ciclo = itertools.cycle(nomes)
    for scene in script["scenes"]:
        if scene.get("type") in SCENE_TYPES_SEM_FOTO:
            continue
        scene["backgroundImage"] = f"images/{next(ciclo)}"


# ── Trilha sonora (freetouse.com) ────────────────────────────────────────────
# API pública sem API key/conta (freetouse.com/api) — catálogo com faixas "Free License"
# (is_premium=false): podem ser usadas em conteúdo monetizado de rede social (Reels)
# desde que com atribuição — por isso o crédito da faixa é anexado à legenda do Instagram
# em gerar_musica_de_fundo(). Faixas "premium" (is_premium=true) exigem licença paga —
# nunca usadas aqui.
FREETOUSE_API = "https://api.freetouse.com/v3"


def _freetouse_escolher_faixa() -> "dict | None":
    try:
        r = requests.get(f"{FREETOUSE_API}/music/tracks/all",
                          params={"limit": 20, "order": "random"}, timeout=15)
        if not r.ok:
            return None
        candidatas = [t for t in r.json().get("data", []) if not t.get("is_premium")]
        return random.choice(candidatas) if candidatas else None
    except Exception as e:
        print(f"   ⚠️  freetouse.com indisponível: {e}")
        return None


def _freetouse_baixar(faixa: dict, dest: Path) -> bool:
    url = (faixa.get("files") or {}).get("mp3")
    if not url:
        return False
    try:
        r = requests.get(url, timeout=60)
        if not r.ok:
            return False
        dest.write_bytes(r.content)
        return True
    except Exception:
        return False


def gerar_musica_de_fundo(script: dict, dest_dir: Path) -> "Path | None":
    """Baixa 1 faixa royalty-free pra trilha de fundo e anexa o crédito obrigatório da
    licença gratuita à legenda do Instagram (script['caption']). Best-effort: qualquer
    falha (rede, API fora) só pula a trilha — nunca interrompe a geração do vídeo."""
    faixa = _freetouse_escolher_faixa()
    if not faixa:
        print("   ⚠️  Nenhuma faixa de música disponível agora — vídeo sai sem trilha")
        return None

    dest = dest_dir / "musica.mp3"
    if not _freetouse_baixar(faixa, dest):
        print("   ⚠️  Falha ao baixar a música — vídeo sai sem trilha")
        return None

    titulo = faixa.get("title", "Sem título")
    artistas = faixa.get("artists") or []
    artista = (artistas[0][1].get("name") if artistas else None) or "Artista desconhecido"
    credito = f'🎵 "{titulo}" por {artista} (freetouse.com)'
    script["caption"] = (script.get("caption", "").rstrip() + f"\n\n{credito}").strip()
    print(f"   🎵 Trilha: \"{titulo}\" — {artista}")
    return dest


# ── ffmpeg mix ───────────────────────────────────────────────────────────────
def mixar_audio(script: dict, video_sem_audio: Path, output_path: Path,
                 musica_path: "Path | None" = None) -> bool:
    """Combina o vídeo mudo com os áudios de cada cena (e, se houver, a trilha de
    fundo) usando ffmpeg."""
    if not shutil.which("ffmpeg"):
        print("⚠️  ffmpeg não encontrado — copiando vídeo sem áudio")
        shutil.copy(video_sem_audio, output_path)
        return True

    def audio_duration(path: str) -> float:
        """Retorna duração real do áudio em segundos via ffprobe."""
        try:
            r = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", path],
                capture_output=True, text=True, timeout=10,
            )
            return float(r.stdout.strip())
        except Exception:
            return 0.0

    # Calcula timestamp de início de cada cena usando duração real do áudio
    # para evitar sobreposição quando a fala é mais longa que a cena visual
    inputs, filters, maps = [], [], []
    t = 0.0
    audio_idx = 0
    for scene in script["scenes"]:
        audio_path = scene.get("_audio_path")
        scene_dur = scene.get("duration", 3)
        if audio_path and pathlib.Path(audio_path).exists():
            real_dur = audio_duration(audio_path)
            inputs += ["-i", audio_path]
            filters.append(
                f"[{audio_idx + 1}:a]adelay={int(t * 1000)}|{int(t * 1000)}[a{audio_idx}]"
            )
            maps.append(f"[a{audio_idx}]")
            audio_idx += 1
            # Avança pelo tempo real do áudio (nunca menor que a duração da cena)
            t += max(scene_dur, real_dur)
        else:
            t += scene_dur

    musica_ok = musica_path and pathlib.Path(musica_path).exists()
    if not maps and not musica_ok:
        print("⚠️  Nenhum áudio encontrado — copiando vídeo sem áudio")
        shutil.copy(video_sem_audio, output_path)
        return True

    inputs_musica = []
    if musica_ok:
        # shortcut: volume fixo (sem sidechain/ducking dinâmico) — suficiente pra dar
        # presença de trilha sem abafar a narração, já normalizada a -16 LUFS. Se a voz
        # ficar difícil de ouvir em cenas longas, trocar por ffmpeg sidechaincompress.
        musica_idx = audio_idx + 1
        inputs_musica = ["-stream_loop", "-1", "-i", str(musica_path)]
        fade_start = max(0.0, t - 1.0)
        filters.append(
            f"[{musica_idx}:a]volume=0.18,atrim=0:{t:.3f},afade=t=out:st={fade_start:.3f}:d=1[music]"
        )
        maps.append("[music]")

    # Mixar todos os áudios e combinar com vídeo
    # O vídeo mudo já tem a duração correta (ajustada via scene.duration no main)
    amix = f"{''.join(maps)}amix=inputs={len(maps)}:normalize=0[aout]"
    filter_complex = ";".join(filters) + ";" + amix
    cmd = (
        ["ffmpeg", "-y", "-i", str(video_sem_audio)]
        + inputs
        + inputs_musica
        + [
            "-filter_complex", filter_complex,
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            str(output_path),
        ]
    )
    print(f"\n🔊 Mixando {len(maps)} faixa(s) de áudio com ffmpeg...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ ffmpeg erro:\n{result.stderr[-500:]}")
        return False
    print(f"✅ Áudio mixado: {output_path}")
    return True

# ── Remotion render ───────────────────────────────────────────────────────────
def renderizar(script: dict, output_path: Path, total_frames: int = 0) -> bool:
    """Renderiza com Remotion. O script passado NÃO deve ter 'audio' nem '_audio_path'."""
    props_file = SCRIPT_DIR / "input-props.json"
    props_file.write_text(json.dumps({"script": script}, ensure_ascii=False))

    print(f"\n🎬 Renderizando com Remotion (vídeo mudo)...")
    print(f"   Saída: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "npx", "remotion", "render",
        "src/index.ts",
        "MotionReel",
        str(output_path),
        "--props", str(props_file),
    ]
    if total_frames > 0:
        cmd += ["--frames", f"0-{total_frames - 1}"]

    # Usamos Popen (não subprocess.run) com um grupo de processos próprio:
    # se o render exceder REMOTION_RENDER_TIMEOUT, matamos a árvore inteira
    # (npx -> node -> workers) via os.killpg. Com subprocess.run(timeout=...),
    # o timeout mata só o processo filho direto (npx) e os processos-nietos
    # continuam renderizando "órfãos" em background, terminando sozinhos
    # depois do Python já ter desistido — foi o que causava vídeos mudos
    # (sem a mixagem de áudio, que só roda se renderizar() retornar True).
    proc = subprocess.Popen(cmd, cwd=SCRIPT_DIR, start_new_session=True)
    try:
        returncode = proc.wait(timeout=REMOTION_RENDER_TIMEOUT)
    except subprocess.TimeoutExpired:
        print(f"\n❌ Remotion não terminou em {REMOTION_RENDER_TIMEOUT}s — encerrando processo e filhos")
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except ProcessLookupError:
            pass
        proc.wait()
        props_file.unlink(missing_ok=True)
        return False
    except Exception as e:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except ProcessLookupError:
            pass
        props_file.unlink(missing_ok=True)
        print(f"\n❌ Erro: {e}")
        return False

    props_file.unlink(missing_ok=True)
    if returncode == 0:
        print(f"\n✅ Vídeo mudo: {output_path}")
        return True
    else:
        print(f"\n❌ Remotion falhou (código {returncode})")
        return False


# ── Histórico de gerações + QA automático (feedback loop do XTTS v2) ────────
# Mesmo padrão simples (JSON, sem SQLite) do .historico.json em post_reel.py —
# volume de ~1 vídeo/dia não justifica nada mais pesado. Alimenta avaliar_video.py
# (nota manual 1-5) e _selecionar_parametros_xtts() (XTTS_AUTOTUNE).
HISTORICO_GERACOES = SCRIPT_DIR.parent / ".historico_geracoes.json"


def carregar_historico_geracoes() -> list:
    if HISTORICO_GERACOES.exists():
        try:
            return json.loads(HISTORICO_GERACOES.read_text())
        except Exception:
            pass
    return []


def salvar_historico_geracoes(geracao: dict) -> None:
    historico = carregar_historico_geracoes()
    historico.append(geracao)
    historico = historico[-200:]
    HISTORICO_GERACOES.write_text(json.dumps(historico, ensure_ascii=False, indent=2))


_VOLUME_RE = re.compile(r"(mean|max)_volume:\s*(-?[\d.]+) dB")


def _qa_audio_niveis(caminho: Path) -> dict:
    """Mede nível médio/pico do .wav (ffmpeg volumedetect) p/ pegar cena muda
    (XTTS gerou áudio vazio) ou com clipping (loudnorm, TP=-1.5, não segurou o pico)."""
    try:
        r = subprocess.run(
            ["ffmpeg", "-i", str(caminho), "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True, timeout=30,
        )
        niveis = dict(_VOLUME_RE.findall(r.stderr))
        mean_db = float(niveis.get("mean", "0"))
        max_db  = float(niveis.get("max", "0"))
    except Exception:
        return {"silence": False, "clipping": False}
    return {"silence": mean_db < -50, "clipping": max_db > -1.0}


def _qa_caption_tem_asterisco(script: dict) -> bool:
    """Guarda de regressão pro bug de '*texto*' vazando pra legenda/narração."""
    for scene in script["scenes"]:
        if "*" in scene.get("_caption", ""):
            return True
        if any("*" in w.get("text", "") for w in scene.get("_words", [])):
            return True
    return False


_TOKEN_RE = re.compile(r"[a-zà-úA-ZÀ-Ú0-9]+")
_ULTIMA_RELEVANCIA_PIXABAY: list = []
_STOPWORDS_EN = {
    "the", "and", "with", "for", "from", "into", "onto", "while", "her", "his", "their",
    "she", "him", "them", "this", "that", "these", "those", "being", "over", "under",
    "person", "someone", "wearing", "sitting", "standing", "looking", "holding",
}


def _relevance_tokens(texto: str) -> set:
    return {w.lower() for w in _TOKEN_RE.findall(texto or "") if len(w) > 2}


def _pixabay_keywords(texto: str, n: int = 4) -> str:
    """Reduz uma frase descritiva longa (ex: imagePrompt do Gemini) a ~5 palavras-chave
    concretas, na ordem original, sem repetir. A busca do Pixabay é por palavra-chave —
    mandar a frase inteira (10+ palavras, com stopwords em inglês tipo "with"/"while")
    dilui o match e costuma trazer resultado genérico sem relação com a cena."""
    vistos, out = set(), []
    for w in _TOKEN_RE.findall((texto or "").lower()):
        if len(w) <= 2 or w in _STOPWORDS_EN or w in vistos:
            continue
        vistos.add(w)
        out.append(w)
        if len(out) >= n:
            break
    return " ".join(out)


def _pixabay_relevancia(query: str, tags: str) -> float:
    """Sobreposição de tokens busca x tags do Pixabay — usado em _pixabay_fallback
    pra escolher o hit mais relevante entre os retornados, e também fica no
    histórico (.historico_geracoes.json) como métrica de QA."""
    q, t = _relevance_tokens(query), _relevance_tokens(tags)
    if not q or not t:
        return 0.0
    score = len(q & t) / len(q)
    # Empate é comum (overlap é uma fração discreta de poucos valores possíveis) e, sem
    # desempate, max() fica com o primeiro candidato da lista — que costuma ser uma foto
    # genérica de "celular/tela" (tags amplas tipo "smartphone, screen, wallpaper"), não a
    # foto de finanças de verdade que empatou no mesmo score. Bônus pequeno (não muda a
    # ordem entre scores diferentes, só desempata) pra quem tem as palavras-âncora do tema.
    score += 0.001 * len(t & {"finance", "money"})
    return score


_XTTS_GRADES = {
    "temperature":        [0.75, 0.80, 0.85, 0.90, 0.95],
    "speed":              [1.00, 1.05, 1.10, 1.15, 1.20],
    "repetition_penalty": [8.0, 9.0, 10.0, 11.0, 12.0],
}
_XTTS_DEFAULTS = {"temperature": 0.85, "speed": 1.1, "repetition_penalty": 10.0}
_XTTS_EPSILON  = 0.2


def _selecionar_parametros_xtts() -> tuple:
    """Bandit epsilon-greedy independente por knob (temperature/speed/repetition_penalty).
    Score por entrada do histórico: nota manual (1-5) se existir; senão 1 se algum QA
    automático pegou problema; senão a entrada é ignorada (sem nota e sem problema não
    deve inflar a média). Sem nenhuma entrada avaliável pro knob, usa o default direto
    (sem explorar) — garante zero regressão mesmo com XTTS_AUTOTUNE=1 ligado sem histórico."""
    historico = carregar_historico_geracoes()

    escolhidos = {}
    for knob, grade in _XTTS_GRADES.items():
        pontos: dict = {}
        for g in historico:
            valor = (g.get("xtts_params") or {}).get(knob)
            if valor is None:
                continue
            qa = g.get("qa") or {}
            if g.get("rating") is not None:
                score = g["rating"]
            elif qa.get("audio_silence") or qa.get("audio_clipping") or qa.get("duration_mismatch") or qa.get("caption_markdown_leak"):
                score = 1
            else:
                continue
            pontos.setdefault(round(valor, 4), []).append(score)

        total_entradas = sum(len(s) for s in pontos.values())
        if not pontos:
            escolhidos[knob] = _XTTS_DEFAULTS[knob]
        elif total_entradas < 3 or random.random() < _XTTS_EPSILON:
            escolhidos[knob] = random.choice(grade)
        else:
            medias = {v: sum(s) / len(s) for v, s in pontos.items()}
            melhor = max(medias.values())
            empate = [v for v, m in medias.items() if m == melhor]
            escolhidos[knob] = min(empate, key=lambda v: abs(v - _XTTS_DEFAULTS[knob]))

    return escolhidos["temperature"], escolhidos["speed"], escolhidos["repetition_penalty"]


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run  = "--dry-run" in sys.argv
    ai_image = "--ai-image" in sys.argv

    global XTTS_TEMPERATURE, XTTS_SPEED, XTTS_REPETITION_PENALTY
    if XTTS_AUTOTUNE:
        XTTS_TEMPERATURE, XTTS_SPEED, XTTS_REPETITION_PENALTY = _selecionar_parametros_xtts()
        print(f"🎛️  XTTS_AUTOTUNE: temperature={XTTS_TEMPERATURE} speed={XTTS_SPEED} repetition_penalty={XTTS_REPETITION_PENALTY}")

    tema = " ".join(args) if args else random.choice(TEMAS_FINANCAS)

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = SCRIPT_DIR.parent / "videos_gerados" / f"motion_{ts}"
    audio_dir  = output_dir / "audios"

    # Registrado em .historico_geracoes.json no finally abaixo, sempre — mesmo em
    # --dry-run ou falha (sys.exit(1) levanta SystemExit, que o finally também cobre).
    geracao = {
        "run_id": uuid.uuid4().hex[:8],
        "tema": tema,
        "timestamp": datetime.datetime.now().isoformat(),
        "xtts_params": {
            "temperature": XTTS_TEMPERATURE,
            "speed": XTTS_SPEED,
            "repetition_penalty": XTTS_REPETITION_PENALTY,
        },
        "qa": {},
        "rating": None,
        "status": "failed",
        "output_dir": str(output_dir),
        "video_path": None,
    }
    try:
        # 1. Roteiro
        script = gerar_roteiro(tema)

        # imagePrompts precisa ter 1 item por cena, na mesma ordem (ver SYSTEM_PROMPT) —
        # é isso que garante que a busca no Pixabay seja sobre o conteúdo daquela cena
        # específica, não um pool genérico do tema cicládo por aplicar_imagens_de_fundo.
        n_scenes = len(script["scenes"])
        image_prompts = script.pop("imagePrompts", None) or []
        if not image_prompts:
            image_prompts = _prompts_fallback(script, tema, n_scenes)
        if len(image_prompts) < n_scenes:
            image_prompts = image_prompts + [image_prompts[-1] if image_prompts else tema] * (n_scenes - len(image_prompts))
        image_prompts = image_prompts[:n_scenes]

        # Só busca imagem pra cena que vai de fato exibir uma (aplicar_imagens_de_fundo
        # pula os tipos em SCENE_TYPES_SEM_FOTO) — evita Pixabay/ComfyUI gastar tempo e
        # banda buscando foto pra cena de card/intro/outro que nunca vai usá-la.
        image_prompts_fetch = [
            p for p, scene in zip(image_prompts, script["scenes"])
            if scene.get("type") not in SCENE_TYPES_SEM_FOTO
        ]

        print("\n🔎 Prompts de imagem (busca Pixabay):")
        for i, p in enumerate(image_prompts_fetch):
            print(f"   [{i+1}] {p}")

        print("\n📋 Cenas:")
        for i, scene in enumerate(script["scenes"]):
            label = (
                scene.get("title")
                or scene.get("text")
                or scene.get("cardTitle")
                or (scene.get("items") or [""])[0]
                or ""
            )
            print(f"   [{i+1}] {scene['type']:10} {scene['duration']}s | {label[:45]}")

        # 2. Áudios (salvos em output_dir/audios/, caminho em scene['_audio_path'])
        script, qa_audio = gerar_audios(script, audio_dir)
        geracao["qa"].update(qa_audio)
        _descarregar_xtts_model()

        # 2b. Imagens de fundo com Ken Burns (Pixabay por padrão; --ai-image sobe o ComfyUI
        # automaticamente, usa, e derruba de novo ao final — só se fomos nós que subimos)
        comfyui_proc = _iniciar_comfyui() if ai_image else None
        try:
            imagens = gerar_imagens(image_prompts_fetch, tema, output_dir / "images", usar_ia=ai_image)
            if imagens:
                aplicar_imagens_de_fundo(script, imagens)
            else:
                print("⚠️  Nenhuma imagem disponível (Pixabay/ComfyUI falharam) — usando fundo padrão")

            # Relevância Pixabay: só log/estatística (ver _pixabay_relevancia) — vazio
            # quando --ai-image usou o ComfyUI e não chamou o Pixabay.
            if _ULTIMA_RELEVANCIA_PIXABAY:
                geracao["qa"]["pixabay_relevance_avg"] = sum(_ULTIMA_RELEVANCIA_PIXABAY) / len(_ULTIMA_RELEVANCIA_PIXABAY)
                geracao["qa"]["pixabay_relevance_min"] = min(_ULTIMA_RELEVANCIA_PIXABAY)
                geracao["qa"]["pixabay_relevance_low_count"] = sum(1 for s in _ULTIMA_RELEVANCIA_PIXABAY if s < 0.2)
            else:
                geracao["qa"]["pixabay_relevance_avg"] = None
                geracao["qa"]["pixabay_relevance_min"] = None
                geracao["qa"]["pixabay_relevance_low_count"] = None

            # Salva JSON para inspeção (inclui _audio_path para debug)
            json_out = SCRIPT_DIR / "ultimo_roteiro.json"
            json_out.write_text(json.dumps(script, ensure_ascii=False, indent=2))
            print(f"\n💾 JSON: {json_out}")

            if dry_run:
                print("\n⏭️  --dry-run: pulando renderização")
                print(f"   Áudios em: {audio_dir}")
                geracao["status"] = "dry_run"
                return
        finally:
            _parar_comfyui(comfyui_proc)

        # 2c. Trilha sonora de fundo (freetouse.com, best-effort — ver gerar_musica_de_fundo)
        musica_path = gerar_musica_de_fundo(script, output_dir)

        # 3. Monta script limpo para o Remotion:
        #    - remove _audio_path (campo privado Python)
        #    - remove audio (se Gemini gerou, causaria 404 no bundle)
        #    - promove _caption → caption para exibir como legenda na tela
        #    - ajusta scene.duration para max(visual, audio) p/ Remotion renderizar frames suficientes
        #    - backgroundImage (se houver) passa direto para o Remotion aplicar o Ken Burns
        fps = 30
        script_remotion = copy.deepcopy(script)
        for scene in script_remotion["scenes"]:
            scene.pop("audio", None)
            audio_dur = scene.pop("_audio_duration", None)
            if "_caption" in scene:
                scene["caption"] = scene.pop("_caption")
                if audio_dur is not None:
                    # Garante que a cena dure pelo menos o tempo do áudio
                    scene["duration"] = max(scene["duration"], audio_dur)
                    scene["captionFrames"] = int(audio_dur * fps)
                else:
                    scene["captionFrames"] = int(scene["duration"] * fps)
            if "_words" in scene:
                # Timing por palavra (estimado proporcionalmente, XTTS não tem pred_dur) p/ karaokê
                scene["words"] = scene.pop("_words")
            scene.pop("_audio_path", None)

        # Duração total real em frames para o Remotion
        total_frames = sum(int(s["duration"] * fps) for s in script_remotion["scenes"])

        # 4. Renderiza vídeo mudo
        video_mudo  = output_dir / "reel_mudo.mp4"
        output_path = output_dir / "reel.mp4"

        ok = renderizar(script_remotion, video_mudo, total_frames)

        if ok:
            # 5. Mixa áudio com ffmpeg
            ok = mixar_audio(script, video_mudo, output_path, musica_path)
            video_mudo.unlink(missing_ok=True)

        if ok:
            geracao["status"] = "ok"
            geracao["video_path"] = str(output_path)
            caption = script.get("caption", "")
            if caption:
                print(f"\n📝 Legenda sugerida:\n{caption}")
            print(f"\n🎥 Para postar: reel --video '{output_path}'")
        else:
            # Sinaliza falha de verdade: sem isso, o post_reel.py via returncode==0
            # como "sucesso" e acabava reaproveitando um reel.mp4 antigo de outra pasta.
            print(f"\n❌ Geração do vídeo falhou — sem reel.mp4 final em {output_dir}")
            sys.exit(1)
    finally:
        salvar_historico_geracoes(geracao)

if __name__ == "__main__":
    main()
