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

## Achados importantes (não esquecer)

- **`chaves.zip` na raiz do repo contém credenciais reais** (`.env`,
  `.youtube_token.json`, `client_secret.json`) e **não está no `.gitignore`**.
  Nunca usar `git add -A`/`git add .` sem excluir esse arquivo explicitamente
  (`git restore --staged chaves.zip` depois do add, ou `git add <arquivos específicos>`).
  Já houve leak real desse tipo de credencial no histórico do repo (commit `174827c`).
