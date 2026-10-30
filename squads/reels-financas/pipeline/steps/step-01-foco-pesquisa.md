---
step: 1
name: "Foco da Pesquisa"
type: checkpoint
outputFile: "squads/reels-financas/output/foco-pesquisa.md"
---

# Checkpoint 1: Foco da Pesquisa

## Propósito

Antes de disparar a pesquisa de padrões virais, perguntar ao usuário se há um nicho/tema específico
de finanças pessoais que ele quer explorar hoje (ex.: cartão de crédito, investimentos, reserva de
emergência) ou se prefere deixar em aberto para Victor Viral escolher com base no que está
performando melhor.

## Pergunta ao usuário (via AskUserQuestion)

**Pergunta**: "Tem algum nicho/tema de finanças pessoais específico que você quer explorar nesse
Reel, ou prefere deixar livre para a pesquisa de padrões virais decidir?"

**Opções sugeridas**:
- Cartão de crédito / dívidas
- Investimentos / reserva de emergência
- Sem preferência (deixar a pesquisa decidir)

(a opção "Other" do AskUserQuestion cobre qualquer outro nicho que o usuário queira digitar)

## Ação após resposta

1. Salvar a resposta literal do usuário em `squads/reels-financas/output/foco-pesquisa.md`.
2. Se o usuário não especificar nicho, registrar explicitamente "sem preferência" (não deixar o
   arquivo vazio) para que Victor Viral saiba que deve escolher com base em performance geral.

## Formato de saída

```
FOCO DA PESQUISA

Nicho definido pelo usuário: <nicho ou "sem preferência">
Data: <data>
```

## Avança para

Pipeline Step 2 (Victor Viral — Pesquisa de Padrões Virais).
