---
step: 9
name: "Publicação"
type: agent
agent: rafael-render
execution: subagent
model_tier: fast
inputFile: "squads/reels-financas/output/aprovacao-final.md"
outputFile: "squads/reels-financas/output/publicacao.md"
---

# Step 9: Publicação

## Context Loading

- Ler `squads/reels-financas/output/aprovacao-final.md` — **obrigatório**: este arquivo só existe
  se o checkpoint da Etapa 8 foi explicitamente aprovado pelo usuário. Se o arquivo não existir ou
  não contiver uma aprovação explícita, interromper e não publicar.
- Ler `squads/reels-financas/output/video-gerado.md` para confirmar o caminho exato do vídeo.

## Instructions / Process

1. Verificar que `aprovacao-final.md` contém a confirmação explícita do usuário e o caminho do
   vídeo aprovado.
2. Verificar que o arquivo de vídeo existe de fato no caminho reportado antes de publicar.
3. Invocar a skill `post-reel-cli` chamando **`post_reel.py --video "<caminho>"`** — esta é a única
   etapa do pipeline em que essa flag é usada.
4. Capturar o resultado exato retornado pelo CLI (sucesso com ID/confirmação da Publora, ou erro).
5. Salvar o resultado em `squads/reels-financas/output/publicacao.md`.
6. Atualizar `squads/reels-financas/_memory/runs.md` com a linha desta execução (data, tema,
   output, resultado).

## Output Format

```
EXECUÇÃO — Etapa 9: Publicação

Checkpoint da Etapa 8: APROVADO pelo usuário em <data>.
Comando: post_reel.py --video "<caminho>"
Resultado: <sucesso/erro>
<detalhe do resultado retornado pelo CLI>
```

## Output Example

```
EXECUÇÃO — Etapa 9: Publicação

Checkpoint da Etapa 8: APROVADO pelo usuário em 2026-10-28.
Comando: post_reel.py --video "videos_gerados/reel_2026-10-28_143201.mp4"

Resultado: sucesso
Publicado via Publora. ID da publicação: pub_88213.
```

## Veto Conditions

- Vetar a execução se `squads/reels-financas/output/aprovacao-final.md` não existir ou não contiver
  aprovação explícita do usuário — nunca publicar "por inferência".
- Vetar a execução se o arquivo de vídeo não existir no caminho esperado.

## Quality Criteria

- [ ] Publicação só ocorreu após confirmação explícita do checkpoint da Etapa 8.
- [ ] Comando usado foi exatamente `--video "<caminho>"`, nunca `--dry-run` nesta etapa.
- [ ] Resultado do CLI (sucesso ou erro) foi reportado literalmente.
- [ ] `_memory/runs.md` foi atualizado com a execução.

## Avança para

Fim do pipeline. Resultado final apresentado ao usuário.
