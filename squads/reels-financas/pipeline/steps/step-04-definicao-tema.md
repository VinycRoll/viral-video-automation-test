---
step: 4
name: "Definição de Tema e Legenda"
type: agent
agent: angela-angulo
execution: inline
inputFile: "squads/reels-financas/output/angulo-escolhido.md"
outputFile: "squads/reels-financas/output/tema-definido.md"
---

# Step 4: Definição de Tema e Legenda

## Context Loading

- Ler `squads/reels-financas/output/angulo-escolhido.md` (ângulo aprovado no checkpoint 3).
- Ler `squads/reels-financas/output/padroes-virais.md` (contexto completo dos achados de Victor
  Viral, incluindo exemplos de hook do ângulo escolhido).
- Ler `squads/reels-financas/pipeline/data/tone-of-voice.md` (as 6 opções de tom disponíveis).
- Ler `_opensquad/_memory/company.md` e `squads/reels-financas/_memory/memories.md` (preferências de
  estilo já registradas em rodadas anteriores, se houver).

## Instructions / Process

1. Definir um tema específico de finanças pessoais que se encaixe no ângulo aprovado — nunca um
   tema genérico ou desconectado do ângulo.
2. Escrever o hook (primeira frase) testando mentalmente se ele comunica o ângulo isoladamente nos
   primeiros 2 segundos.
3. Escrever a legenda completa do Reel, reforçando o ângulo e incluindo um CTA específico.
4. Apresentar ao usuário (via persona inline) as opções de tom de voz relevantes de
   `tone-of-voice.md`, recomendando uma com base no ângulo e no perfil da empresa, e aguardar a
   confirmação do usuário antes de finalizar.
5. Salvar a entrega completa em `squads/reels-financas/output/tema-definido.md` e registrar a
   escolha de tom confirmada em `squads/reels-financas/_memory/memories.md` (seção "Estilo de
   Escrita").

## Output Format

```
TEMA DEFINIDO

Ângulo aprovado: <ângulo> (<padrão de origem citado por Victor Viral>)
Tema: <assunto específico>

Hook: "<primeira frase>"

Legenda completa:
"<legenda com CTA>"

Tom recomendado: <opção de tone-of-voice.md> (<justificativa>)
Tom confirmado pelo usuário: <opção confirmada>
```

## Output Example

```
TEMA DEFINIDO

Ângulo aprovado: Aversão à perda (Victor Viral, padrão: hooks de custo > hooks de ganho)
Tema: Juros rotativos do cartão de crédito quando se paga só o valor mínimo da fatura

Hook: "Isso no seu cartão pode estar te custando R$ 50 por mês sem você perceber."

Legenda completa:
"Pagar só o mínimo da fatura parece alívio, mas o juro rotativo come sua fatura mês a mês. Nesse
vídeo, mostro quanto isso custa de verdade — e o que fazer pra parar de perder dinheiro assim.
Salva esse vídeo e revisa sua fatura hoje. 💳"

Tom recomendado: Direto/Urgente (alinhado ao ângulo de aversão à perda e ao perfil didático/
acessível da empresa)
Tom confirmado pelo usuário: Direto/Urgente
```

## Veto Conditions

- Vetar a entrega se o tema não refletir claramente o ângulo aprovado no checkpoint 3.
- Vetar a entrega se o tom de voz não tiver sido apresentado como opções e confirmado pelo usuário
  (nunca decidido unilateralmente por Ângela).

## Quality Criteria

- [ ] Tema é específico e cabe em um Reel curto (~30-60s).
- [ ] Hook comunica o ângulo isoladamente.
- [ ] Legenda inclui CTA específico.
- [ ] Tom de voz foi confirmado pelo usuário, não escolhido unilateralmente.

## Avança para

Pipeline Step 5 (checkpoint de Aprovação do Conteúdo).
