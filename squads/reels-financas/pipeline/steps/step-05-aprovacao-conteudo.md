---
step: 5
name: "Aprovação do Conteúdo"
type: checkpoint
outputFile: "squads/reels-financas/output/aprovacao-conteudo.md"
on_reject: "4"
---

# Checkpoint 5: Aprovação do Conteúdo (Gate 2b — bloqueante)

## Propósito

Este é o Content Approval Gate obrigatório antes de qualquer geração de vídeo. Apresentar ao
usuário o tema, hook, legenda e tom definidos por Ângela Ângulo em
`squads/reels-financas/output/tema-definido.md`, e aguardar aprovação explícita antes de disparar a
geração do vídeo (que consome tempo e recursos de Gemini/XTTS/Pixabay).

## Pergunta ao usuário (via AskUserQuestion)

**Pergunta**: "Esse é o tema/legenda definido para o Reel de hoje. Posso gerar o vídeo em dry-run
com isso?"

(apresentar o conteúdo completo de `tema-definido.md` antes da pergunta)

**Opções**:
- Sim, gerar o vídeo (Recomendado)
- Quero ajustar o tema/hook/legenda
- Quero trocar o tom de voz

## Ação após resposta

1. Se aprovado: salvar a confirmação em `squads/reels-financas/output/aprovacao-conteudo.md` e
   avançar.
2. Se o usuário pedir ajuste: voltar para o Pipeline Step 4 (`on_reject: "4"`), passando o motivo do
   ajuste para Ângela Ângulo refazer apenas a parte apontada.

## Formato de saída

```
APROVAÇÃO DO CONTEÚDO

Tema aprovado: <tema>
Tom aprovado: <tom>
Aprovado por: usuário
Data: <data>
```

## Avança para

Pipeline Step 6 (Rafael Render — Geração do Vídeo em dry-run).
