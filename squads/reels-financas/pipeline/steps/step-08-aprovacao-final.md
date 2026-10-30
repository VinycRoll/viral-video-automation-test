---
step: 8
name: "Aprovação Final"
type: checkpoint
outputFile: "squads/reels-financas/output/aprovacao-final.md"
on_reject: "6"
---

# Checkpoint 8: Aprovação Final (Gate 2b — bloqueante)

## Propósito

Este é o gate mais importante do squad: nenhuma publicação acontece sem passar por aqui. Mostrar ao
usuário o vídeo gerado em dry-run (`squads/reels-financas/output/video-gerado.md`) e o parecer de
qualidade de Paula Parecer (`squads/reels-financas/output/revisao-qualidade.md`), e aguardar
aprovação explícita antes de Rafael Render executar `post_reel.py --video`.

## Pergunta ao usuário (via AskUserQuestion)

**Pergunta**: "O vídeo foi gerado em `<caminho do vídeo>` com o parecer `<veredito de Paula
Parecer>`. Assista ao vídeo. Posso publicar agora com `post_reel.py --video`?"

(apresentar o caminho do vídeo, o resumo do REVIEW VERDICT de Paula Parecer, e instruir o usuário a
assistir ao arquivo antes de decidir)

**Opções**:
- Sim, publicar agora (Recomendado quando o veredito é APROVAR)
- Gerar de novo (novo tema aleatório)
- Quero ajustar antes de publicar

## Ação após resposta

1. Se aprovado: salvar a confirmação explícita em
   `squads/reels-financas/output/aprovacao-final.md`, incluindo o caminho exato do vídeo aprovado —
   essa confirmação é a condição que Rafael Render verifica antes de publicar.
2. Se rejeitado (gerar de novo ou ajustar): voltar para o Pipeline Step 6 (`on_reject: "6"`), nunca
   avançar para a Etapa 9 nesse caso.

## Formato de saída

```
APROVAÇÃO FINAL

Vídeo aprovado: <caminho do vídeo>
Veredito da revisão de qualidade: <veredito>
Aprovado por: usuário
Data: <data>
```

## Avança para

Pipeline Step 9 (Rafael Render — Publicação). **Nunca executar a Etapa 9 sem este arquivo de
aprovação explícita.**
