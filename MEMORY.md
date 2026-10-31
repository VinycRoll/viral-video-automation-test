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

## Em andamento

- **Experimento Motion Canvas/Revideo** (pedido do usuário, 2026-10-31): avaliar se
  animação procedural (`yield*`, generator functions) do Revideo (fork do Motion
  Canvas pra automação headless) dá resultado visualmente melhor que o Remotion
  atual (`useCurrentFrame()`), especialmente pra cenas com duração dinâmica (baseada
  no áudio real). Instrução do usuário: testar, auditar visualmente, se melhorar
  focar em aprimorar, se piorar reverter pro checkpoint `main@01d9ccf` — por isso a
  branch separada.
  - Pacote correto no npm é `@revideo/create` (não `@revideo/create-project`).
  - `npm create @revideo/create@latest` falha (resolve errado pra `create-create`);
    usar `npx --yes @revideo/create@latest` direto. O CLI é interativo (prompts de
    nome/path/template) — meio de automatizar isso ainda não validado neste momento.
  - Scaffolding ainda **não concluído** — próxima sessão deve retomar daqui.
  - Escopo decidido: só portar UMA cena (growth/gráfico de linha, candidata natural
    por já ser "procedural" por natureza) como prova de conceito, não migrar o
    pipeline inteiro. Comparar frames extraídos (ffmpeg) do Remotion atual vs. Revideo.

## Achados importantes (não esquecer)

- **`chaves.zip` na raiz do repo contém credenciais reais** (`.env`,
  `.youtube_token.json`, `client_secret.json`) e **não está no `.gitignore`**.
  Nunca usar `git add -A`/`git add .` sem excluir esse arquivo explicitamente
  (`git restore --staged chaves.zip` depois do add, ou `git add <arquivos específicos>`).
  Já houve leak real desse tipo de credencial no histórico do repo (commit `174827c`).
