---
step: 6
name: "Geração do Vídeo (dry-run)"
type: agent
agent: rafael-render
execution: subagent
model_tier: fast
inputFile: "squads/reels-financas/output/tema-definido.md"
outputFile: "squads/reels-financas/output/video-gerado.md"
---

# Step 6: Geração do Vídeo (dry-run)

## Context Loading

- Ler `squads/reels-financas/output/tema-definido.md` (tema, hook, legenda e tom aprovados no
  checkpoint 5).
- Ler `skills/post-reel-cli/SKILL.md` para confirmar a forma correta de invocação do CLI.

## Instructions / Process

1. Invocar a skill `post-reel-cli` chamando o script existente **`post_reel.py --dry-run`**,
   passando o tema definido para orientar a geração do roteiro — nunca escrever ou reimplementar o
   roteiro, narração ou fundo por conta própria; isso é feito internamente pelo `post_reel.py`
   (Gemini, XTTS v2, Pixabay/ComfyUI).
2. Capturar da saída do CLI o caminho do vídeo gerado (`videos_gerados/<arquivo>.mp4`, conforme
   `VIDEOS_DIR` do script).
3. Ler o roteiro real que foi efetivamente gerado em `remotion-template/ultimo_roteiro.json` (o
   Gemini pode ter ajustado detalhes em relação ao tema/hook/legenda de entrada).
4. Se o CLI retornar erro (timeout de API, falha de geração), reportar o erro literal e interromper
   o pipeline nesta etapa — nunca inventar um resultado de sucesso.
5. Salvar caminho do vídeo, caminho do roteiro real e legenda usada em
   `squads/reels-financas/output/video-gerado.md`.

## Output Format

```
EXECUÇÃO — Etapa 6: Geração do Vídeo (dry-run)

Comando: post_reel.py --dry-run (tema: "<tema>")
Resultado: <sucesso/erro>
Vídeo salvo em: <caminho>
Roteiro real gerado em: remotion-template/ultimo_roteiro.json
Legenda usada: "<legenda>"
```

## Output Example

```
EXECUÇÃO — Etapa 6: Geração do Vídeo (dry-run)

Comando: post_reel.py --dry-run (tema: "Juros rotativos do cartão quando se paga só o mínimo")
Resultado: sucesso
Vídeo salvo em: videos_gerados/reel_2026-10-28_143201.mp4
Roteiro real gerado em: remotion-template/ultimo_roteiro.json
Legenda usada: "Pagar só o mínimo da fatura parece alívio, mas o juro rotativo come sua fatura
mês a mês. [...] Salva esse vídeo e revisa sua fatura hoje. 💳"

Pronto para revisão de qualidade (Paula Parecer) e aprovação final do usuário.
```

## Veto Conditions

- Vetar o avanço se o caminho do vídeo reportado pelo CLI não existir de fato no sistema de
  arquivos.
- Vetar o avanço se o CLI retornar erro — o pipeline deve parar na Etapa 6, não seguir para revisão
  com um vídeo inexistente.

## Quality Criteria

- [ ] Comando usado foi exatamente `--dry-run` (nunca `--video` nesta etapa).
- [ ] Caminho do vídeo e do roteiro real foram reportados literalmente.
- [ ] Erros do CLI, se houver, foram reportados sem mascaramento.

## Avança para

Pipeline Step 7 (Paula Parecer — Revisão de Qualidade).
