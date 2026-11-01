# MEMORY.md — andamento do projeto instagram-reels

Arquivo de memória persistente entre sessões. Atualizar sempre que concluir, decidir
ou abandonar algo relevante. Não duplicar o que já está no `CLAUDE.md` (regras do
Opensquad) — aqui é progresso e decisões, não instruções fixas.

## Checkpoint atual

- Branch `main`, commit `01d9ccf` — ponto de restauração seguro antes do experimento
  Motion Canvas/Revideo (ver abaixo). Qualquer regressão: `git checkout main`.
- Branch `experimento-motion-canvas` criada a partir daqui para testar engine de
  animação alternativa sem arriscar o pipeline em produção.

## Concluído

- **SYSTEM_PROMPT do Gemini (`remotion-template/gerar_motion.py`) reescrito para ser
  multi-nicho** (antes só finanças). Adapta tom/vocabulário ao nicho recebido; se não
  receber tema, sorteia um nicho aleatório sozinho. Inclui auto-verificação no prompt
  (somar duração das cenas, contar cenas vs. imagePrompts) pra reduzir drift do LLM.
  `maxOutputTokens` subiu de 2000→4096 (prompt maior trunca em 2000).
  Validado empiricamente gerando roteiros reais em 6+ nichos (culinária, produtividade,
  saúde, história, motivação, auto-seleção de tema) — ver `/tmp/test_*.json` (scratch,
  não commitados). Resultado: imagePrompts bate com nº de cenas, duração total na faixa
  de 55-70s, 10-12 cenas.
- **`post_reel.py` tornado multi-nicho**: lista `TEMAS` expandida (20 temas de finanças
  + ~20 novos em culinária/produtividade/saúde/história/motivação), removido hashtag/
  emoji/texto hardcoded de finanças (`HASHTAGS_BASE`, `titulo_yt`, `montar_caption`,
  docstrings, prints de banner).
- Dry-run completo do pipeline (Gemini→XTTS→Pixabay) com tema de saúde rodou limpo:
  11 cenas, 11 imagePrompts (bateu certo), áudio XTTS gerado sem erro.

## Concluído (continuação)

- **Experimento Motion Canvas/Revideo** (pedido do usuário, 2026-10-31) — **finalizado,
  decisão: não migrar**. Portei a cena `growth` real (roteiro "regra dos 2 minutos")
  pro Revideo (`@revideo/create`, template `default`), renderizei headless
  (Puppeteer + `--no-sandbox`, necessário neste ambiente) e comparei frame a frame
  com um still do Remotion atual gerado com os mesmos dados
  (`npx remotion still ... --props=... --frame=125`).
  - **Resultado**: qualidade visual equivalente. O bug de gap nos vértices do SVG
    (motivo original da ideia, comentário em `GrowthScene.tsx`) **já estava
    corrigido** no Remotion antes do experimento — nenhum dos dois mostra o
    problema. O `Line.start/end` nativo do Revideo é mais limpo que o cálculo
    manual de `pathLength` do Remotion, mas o ganho visual real é zero.
  - **Custo de adoção** seria alto: segunda pipeline de render completa em paralelo
    (Puppeteer+Chromium, ~400MB, Vite próprio) e reescrever as 9 cenas existentes do
    zero — não compensa por um empate visual.
  - **Alternativa de baixo custo encontrada e registrada, não instalada**: a lib
    `procedural-to-declarative` (npm, ~30KB, zero deps) compila código `yield*` em
    uma função `tempo→estado` pura — dá pra escrever cenas complexas com sintaxe
    procedural **sem trocar de motor de render**. Vale considerar se uma cena futura
    precisar de sequenciamento complexo demais pra `interpolate()` manual.
  - Detalhes completos e os 2 frames comparados:
    `motion-canvas-experimento/AUDITORIA.md` (branch `experimento-motion-canvas`,
    nunca mergeada em `main` — pasta listada no `.gitignore` da `main` de propósito).
    Branch pode ser apagada quando quiser (`git branch -D experimento-motion-canvas`),
    `main` não foi tocada pelo experimento.

- **Nova cena `notification`** (pedido do usuário, 2026-10-31) — notificação de app sobre
  lock screen (estilo native-ui/motionmaxxing: `~/.claude/skills/motionmaxxing/runtime/
  native-ui/`), **portada para React/Remotion em vez de usar o renderer próprio do skill**
  (que é uma 2ª pipeline HTML+GSAP+Chrome headless — mesmo raciocínio da rejeição do
  Revideo: não duplicar motor de render por um ganho visual que o pipeline atual já
  consegue reproduzir). CSS trimado copiado para
  `remotion-template/src/scenes/native-ui.css` (só phone/lock/notification — sem
  status bar/tabbar/app screen, não usados). Componente novo
  `remotion-template/src/scenes/NotificationScene.tsx`: notificação mais recente "chega"
  deslizando de baixo (`interpolate` + easing, ~0.45s), depois a câmera avança (`scale`
  em torno de `transformOrigin: "50% 76%"`) até a notificação virar o quadro — réplica
  simplificada das funções `arrive`/`macro` do `native-ui.js` (que usam GSAP + medição de
  DOM; aqui é só `interpolate()` porque o layout é conhecido/fixo). Sem foto de fundo
  (mesmo padrão de `proof`/`growth`/`card`), adicionada ao `SEM_FOTO` em `gerar_motion.py`.
  Campos no roteiro: `notifAppLetter`, `notifAppColor`, `notifTitle`, `notifBody`,
  `notifTime`, `lockTime`, `lockDate`, `notifOlder*` (2ª notificação empilhada, opcional).
  SYSTEM_PROMPT do Gemini atualizado: app/remetente são fictícios e **adaptados ao nicho**
  do roteiro (app de investimento pra finanças, de receitas pra culinária, etc.), uso no
  máx. 1x por roteiro, não obrigatório — mesma regra de uso esparso de `proof`/`growth`.
  Validado com `npx remotion still`/`render` (stills em frames-chave + clipe de 5s da
  cena isolada): chegada e push-in ficaram suaves, texto legível, zero erro de render.
  Escopo desta rodada: só o beat "notificação chega + câmera lê" (o mais citado pelo
  usuário como referência). Outros tipos de animação "estilo motionmaxxing" (ex: app
  screen com lista, hero 3D) ficam pra uma próxima rodada se o usuário pedir — não foram
  construídos agora pra não adivinhar requisito que não foi pedido.

- **Maratona de cenas motionmaxxing concluída** (pedido do usuário, 2026-10-31) —
  "gere o máximo possível de novos tipos de cena, trabalhando sem parar enquanto eu
  estou fora". Ele citou 3 exemplos (calendário, relógio, pilha de dinheiro) e autorizou
  ir além. Resultado final: **13 tipos de cena novos**, todos sem foto de fundo
  (adicionados ao `SEM_FOTO`), documentados no `SYSTEM_PROMPT` do Gemini com regra de
  uso esparso (máx. 1x por roteiro cada), com campos em `types.ts`, wired no `switch` de
  `MotionReel.tsx`, com demo em `Root.tsx` e **todos testados via `npx remotion still`**
  antes de marcar como prontos:
  - `calendar` — card de calendário com dia "virando" (flip 3D) + anel de destaque.
  - `clock` — digital (glow neon) ou analógico (ponteiros via spring).
  - `moneystack` — pilha de notas caindo + contador subindo (bug de parse pt-BR achado
    e corrigido no teste).
  - `checklist` — itens marcando check em sequência (reaproveita `UiCard`).
  - `progress` — anel de progresso enchendo + contador central.
  - `timer` — cronômetro regressivo, anel esvaziando + dígitos "MM:SS".
  - `rating` — 5 estrelas pipocando revelando nota (decimal via `clipPath`).
  - `scale` — balança de 2 pratos pendendo via trigonometria simples (bug de overflow de
    texto no prato achado e corrigido no teste).
  - `map` — grade de pontos + pin caindo + radar pulsando em loop.
  - `weather` — sol (raios girando) / nublado / chuva (gotas em loop escalonado).
  - `achievement` — badge/medalha pipocando com burst + fitas, pra meta/conquista batida.
  - `battery` — bateria enchendo de baixo pra cima + contador, pra reserva/energia
    se acumulando aos poucos (distinto do anel de `progress`).
  - `book` — livro fechado que abre (capa gira na lombada, mesma técnica de `rotateX`/
    `rotateY` do flip do `calendar`) revelando título, pra aprendizado/educação.

  Toda a animação usa só `interpolate`/`spring` nativos do Remotion (nunca GSAP/
  Puppeteer — decisão já validada no experimento Revideo/Motion Canvas, que concluiu que
  uma 2ª pipeline de render não compensa o ganho visual). Lista de ideias da instrução
  original está essencialmente esgotada; se surgir necessidade de mais tipos de cena,
  repetir o mesmo padrão de 7 passos (campos em `types.ts` → componente em `scenes/` →
  wire em `MotionReel.tsx` → `SEM_FOTO` → `SYSTEM_PROMPT` → testar via still → documentar
  aqui).

- **4 ajustes de qualidade pedidos pelo usuário** (`remotion-template/gerar_motion.py`,
  2026-10-31): vídeo abria em silêncio, narração "robótica/desanimada", sem trilha
  sonora, e textos aparecendo com asteriscos literais (`**exemplo**`) na tela.
  - **Silêncio no início**: `SYSTEM_PROMPT` agora exige narração não-vazia na cena
    "intro" (antes era opcional) — o gancho falado tem que começar junto com o vídeo.
  - **Asteriscos vazando**: causa raiz era a regra geral "use *texto*/**texto**" do
    `SYSTEM_PROMPT` valendo pra qualquer campo, mas só `text`/`cardNote`/`items` (lista
    do `ListScene`) são de fato renderizados via `parseText()`/`splitHighlightWords()`
    (`src/utils/text.tsx`) — os ~20 outros tipos de cena (proof, calendar, checklist,
    battery etc.) sempre mostraram a string crua. Fix: `_limpar_markdown_fora_de_escopo()`
    varre o JSON do Gemini recursivamente logo após o parse e remove `*`/`**` de todo
    campo fora da allowlist `{"text","cardNote","items"}` — inclui `narration` (corrige
    de vez o vazamento pra legenda/karaokê, que usava o texto crú em `_caption`).
  - **Voz robótica**: o `.env` já usa `XTTS_SPEAKER_WAV` (clone da voz do usuário, não um
    speaker pré-treinado — já era o maior lever de expressividade, já aplicado). Ajuste
    feito: `XTTS_TEMPERATURE` 0.75→0.85 e `XTTS_SPEED` 1.05→1.1 (mais variação prosódica),
    `_XTTS_DEFAULTS` do autotune atualizado em conjunto. **Observação importante pro
    usuário**: a clonagem do XTTS tende a herdar a energia/entonação do próprio arquivo
    de referência (`voices/vinycius_ref.wav`) — se a gravação de referência foi feita num
    tom calmo/monótono, regravar esse arquivo com mais energia é provavelmente o que mais
    vai resolver, mais do que qualquer parâmetro. `.historico_geracoes.json` mostra 17
    gerações, nenhuma avaliada ainda via `avaliar_video.py` — sem notas, o autotune
    (`XTTS_AUTOTUNE=1`) não tem como aprender nada ainda.
  - **Trilha sonora**: nova (API pública **freetouse.com**, achada via busca no GitHub/
    web — sem API key, sem conta, sem limite documentado). `gerar_musica_de_fundo()`
    baixa 1 faixa aleatória não-premium (`is_premium=false` — as "premium" exigem
    licença paga, nunca usadas) por geração e anexa o crédito obrigatório à legenda do
    Instagram (licença gratuita do freetouse.com permite monetizar conteúdo de rede
    social, desde que com atribuição). `mixar_audio()` ganhou parâmetro `musica_path`:
    `-stream_loop -1` + `volume=0.18` (fixo, sem ducking dinâmico — shortcut documentado
    no código) + `afade` de saída de 1s + `-shortest` no comando final pra não esticar a
    duração do vídeo. Testado de ponta a ponta com vídeo/áudio sintéticos via ffmpeg:
    baixou faixa real, mixou, saída com duração exata e volume da trilha bem abaixo da
    voz. Upgrade futuro se a voz ficar difícil de ouvir: troca pra
    `ffmpeg sidechaincompress` (ducking real).

## Em andamento (2026-10-31, à noite)

- **Auditoria ponytail pós-maratona de cenas**: rodada de `/ponytail:ponytail-audit` sobre
  os fixes do dia (OOM no XTTS, OAuth do YouTube travando, `--video --dry-run` postando
  de verdade, fetch de imagem desperdiçado pra cena sem foto, grades do autotune
  descentralizadas, `.gitignore` duplicado) + os 13 componentes de cena novos. Tudo
  commitado (`42c684d`). 2 achados nos componentes novos, 1 já corrigido:
  - **Corrigido**: `NotificationScene`/`native-ui.css` — `.nu-notif-body` sem
    `line-clamp` deixava `notifBody` longo ser cortado no meio da frase pelo
    `overflow:hidden` do `.nu-screen`. Fix: `-webkit-line-clamp: 2` (Chromium do Remotion
    suporta, trunca com "…").
  - **Pendente, baixa prioridade**: `UiCard` (`src/utils/uiCard.tsx`) foi extraído pra
    não duplicar o wrapper visual do card, mas `ProofScene`/`CardScene` continuam com o
    mesmo bloco de estilo inline — só `ChecklistScene` usa o componente de fato. Migrar
    os dois quando sobrar tempo (~10 linhas duplicadas cada).

- **Batch de geração rodando em background** (pedido do usuário, "crie roteiros, analise,
  crie animações, alimente o banco de dados, sem limite de tempo") — script
  `batch_gerar.sh` (raiz do repo) roda `python3 post_reel.py --dry-run` em loop, até 100
  vezes, parando sozinho após 3 falhas consecutivas. Lançado com `nohup`+`disown`
  (processo sobrevive ao fim da sessão do Claude Code; só para se a máquina reiniciar ou
  alguém matar o processo manualmente). Log em `batch_log.txt` (raiz do repo, não
  commitado — ver se cabe no `.gitignore` se crescer muito).
  - **`XTTS_AUTOTUNE=1` foi ligado no `.env`** especificamente pra este batch (estava
    desligado/"0" por padrão) — sem isso, toda rodada usaria os mesmos parâmetros fixos
    e o histórico não teria variedade nenhuma pro bandit explorar. Cada rodada agora
    sorteia um ponto da grade de `temperature`/`speed`/`repetition_penalty`
    (`_selecionar_parametros_xtts()` em `gerar_motion.py`). **Decisão a revisitar**: se
    o usuário não quiser isso ligado permanentemente depois do batch, desligar de volta
    (`XTTS_AUTOTUNE=0` ou remover a linha do `.env`).
  - `.historico_geracoes.json` tinha 18 entradas antes do batch começar (acumuladas de
    testes manuais anteriores nesta sessão, nenhuma avaliada via `avaliar_video.py`).
  - **Limitação conhecida, avisada ao usuário**: como é tudo `--dry-run` não-assistido,
    nenhuma entrada vai ganhar `rating` manual — o autotune só vai aprender com os QA
    automáticos (binário: teve problema ou não), nunca vai saber qual geração ficou
    *boa* de verdade. Pra aproveitar o volume gerado, o usuário precisa rodar
    `avaliar_video.py` depois e dar notas em uma amostra dos vídeos em
    `videos_gerados/`.
  - Um loop de monitoramento (`/loop`, modo dinâmico, sem Monitor tool disponível neste
    ambiente — só `ScheduleWakeup` de ~20-25min) foi armado pra avisar o usuário a cada
    rodada concluída e dar o resumo final quando `batch_gerar.sh` não estiver mais no
    `pgrep`. Se a sessão acabar e o loop não sobreviver, o usuário ainda pode checar
    manualmente: `tail -f batch_log.txt` e `python3 -c "import json; print(len(json.load(open('.historico_geracoes.json'))))"`.

## Achados importantes (não esquecer)

- **`chaves.zip` na raiz do repo contém credenciais reais** (`.env`,
  `.youtube_token.json`, `client_secret.json`) e **não está no `.gitignore`**.
  Nunca usar `git add -A`/`git add .` sem excluir esse arquivo explicitamente
  (`git restore --staged chaves.zip` depois do add, ou `git add <arquivos específicos>`).
  Já houve leak real desse tipo de credencial no histórico do repo (commit `174827c`).
