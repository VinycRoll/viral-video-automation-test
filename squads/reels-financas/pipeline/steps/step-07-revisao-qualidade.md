---
step: 7
name: "Revisão de Qualidade"
type: agent
agent: paula-parecer
execution: subagent
model_tier: powerful
inputFile: "squads/reels-financas/output/video-gerado.md"
outputFile: "squads/reels-financas/output/revisao-qualidade.md"
format: instagram-reels
---

# Step 7: Revisão de Qualidade

## Context Loading

- Ler `squads/reels-financas/output/video-gerado.md` (caminho do vídeo, roteiro real em
  `remotion-template/ultimo_roteiro.json`, legenda usada).
- Ler `squads/reels-financas/output/angulo-escolhido.md` (ângulo aprovado no checkpoint 3, para
  verificar aderência).
- Ler `squads/reels-financas/pipeline/data/quality-criteria.md` (rubrica completa com os 6
  critérios e limiares de veredito).

## Instructions / Process

1. Avaliar o roteiro real (`ultimo_roteiro.json`) e a legenda contra os 6 critérios: Hook,
   Alinhamento com ângulo, Especificidade, CTA, Duração/ritmo, Legenda.
2. Atribuir nota de 0 a 10 a cada critério, com justificativa específica de uma linha.
3. Calcular a média e aplicar o limiar de `quality-criteria.md` para decidir o veredito: APROVAR
   (média ≥7/10, nenhum critério <4/10), APROVAR COM RESSALVAS (média 5-7/10, sem falha
   eliminatória) ou REJEITAR (média <5/10, ou qualquer critério <4/10, ou desalinhamento claro com
   o ângulo aprovado).
4. Escrever o parecer final em `squads/reels-financas/output/revisao-qualidade.md`.

## Output Format

```
REVIEW VERDICT: <APROVAR / APROVAR COM RESSALVAS / REJEITAR>

| Critério                  | Nota | Justificativa |
|----------------------------|------|----------------|
| Hook                       | X/10 | ...            |
| Alinhamento com ângulo     | X/10 | ...            |
| Especificidade             | X/10 | ...            |
| CTA                        | X/10 | ...            |
| Duração/ritmo              | X/10 | ...            |
| Legenda                    | X/10 | ...            |

Média: X.X/10. <observação sobre critérios eliminatórios>

Recomendação: <texto para o usuário decidir no checkpoint final>
```

## Output Example

```
REVIEW VERDICT: APROVAR

| Critério                  | Nota | Justificativa                                              |
|----------------------------|------|--------------------------------------------------------------|
| Hook                       | 9/10 | Primeira frase comunica custo concreto em 2s.                |
| Alinhamento com ângulo     | 9/10 | Aversão à perda mantida do início ao fim.                    |
| Especificidade             | 8/10 | Valor em R$ e cenário concreto (fatura mínima).               |
| CTA                        | 7/10 | "Revisa sua fatura hoje" é ação clara, mas pouco específica.  |
| Duração/ritmo              | 8/10 | 38s, dentro da faixa ideal para o formato.                   |
| Legenda                    | 8/10 | Reforça o hook sem repetir literalmente.                      |

Média: 8.2/10. Nenhum critério abaixo de 4/10. Alinhamento forte com o ângulo aprovado.

Recomendação: aprovar para publicação.
```

## Veto Conditions

- Vetar a entrega se qualquer critério ficar sem nota numérica ou justificativa.
- Vetar o veredito APROVAR se o critério "Alinhamento com ângulo" estiver abaixo de 4/10, mesmo que
  a média geral pareça aceitável.

## Quality Criteria

- [ ] Todos os 6 critérios avaliados com nota e justificativa específica.
- [ ] Veredito segue o limiar objetivo definido em `quality-criteria.md`.
- [ ] Recomendação final clara para o checkpoint seguinte.

## Avança para

Pipeline Step 8 (checkpoint de Aprovação Final).
