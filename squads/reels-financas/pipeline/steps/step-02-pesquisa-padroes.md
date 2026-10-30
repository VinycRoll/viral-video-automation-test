---
step: 2
name: "Pesquisa de Padrões Virais"
type: agent
agent: victor-viral
execution: subagent
model_tier: powerful
inputFile: "squads/reels-financas/output/foco-pesquisa.md"
outputFile: "squads/reels-financas/output/padroes-virais.md"
---

# Step 2: Pesquisa de Padrões Virais

## Context Loading

- Ler `squads/reels-financas/output/foco-pesquisa.md` (nicho definido no checkpoint 1, ou "sem
  preferência").
- Ler `squads/reels-financas/pipeline/data/research-brief.md` (pesquisa de base já compilada sobre
  padrões virais de Reels de finanças pessoais) para contexto adicional e para evitar repetir
  buscas já documentadas.
- Ler `_opensquad/_memory/company.md` para alinhar o tom geral esperado (didático, acessível).

## Instructions / Process

1. Se o nicho estiver definido, buscar (web_search) Reels/vídeos virais recentes especificamente
   relacionados a esse nicho. Se estiver "sem preferência", buscar os padrões de maior performance
   no nicho de finanças pessoais em geral e escolher um tema-base alinhado a esses padrões.
2. Selecionar as 3-5 fontes mais relevantes e extrair, de cada uma: tipo de hook, estrutura
   narrativa, formato visual, e explicação do motivo da performance (quando a fonte fornecer).
3. Atribuir nível de confiança (ALTA/MÉDIA/BAIXA) a cada padrão identificado, conforme os critérios
   do agente Victor Viral.
4. Redigir 3 a 5 ângulos candidatos para o tema do dia, cada um citando o padrão de origem e,
   quando possível, um exemplo real do hook correspondente.
5. Escrever a seção de gaps declarando o que não foi encontrado, verificado ou que ficou com
   confiança baixa.

## Output Format

```
PADRÕES VIRAIS — Nicho: <nicho>
Pesquisado em: <data>

ÂNGULOS CANDIDATOS

1. <Nome do ângulo> — "<exemplo de hook>"
   Padrão: <descrição do padrão> Confiança: <ALTA/MÉDIA/BAIXA> (<justificativa>).

[... 3 a 5 ângulos ...]

RECOMENDAÇÃO: <qual(is) ângulo(s) recomendar e por quê>

GAPS: <o que não foi encontrado/verificado>
```

## Output Example

```
PADRÕES VIRAIS — Nicho: Reserva de Emergência
Pesquisado em: 2026-10-28

ÂNGULOS CANDIDATOS

1. Erro/confissão numérica — "Fiquei 2 anos sem reserva e um imprevisto de R$ 2.000 quase me
   quebrou"
   Padrão: hook de número + confissão pessoal. Confiança: MÉDIA (convergência entre 3 fontes).

2. Aversão à perda — "Sem reserva, qualquer imprevisto te obriga a usar o cartão e pagar juro
   absurdo"
   Padrão: aversão à perda supera hook de ganho puro. Confiança: MÉDIA.

3. Comparação numérica/infográfico — "Com R$3.000 de salário, guardando R$150/mês, em 1 ano você
   tem uma reserva de 1 mês de gastos"
   Padrão: formato infográfico é salvo 3x mais que pessoa falando. Confiança: MÉDIA.

RECOMENDAÇÃO: ângulo 2 (aversão à perda) tem maior aderência ao tom didático/acessível da empresa;
ângulo 3 é forte se quisermos priorizar formato visual/infográfico.

GAPS: nenhuma fonte é dado oficial de plataforma; achados vêm de blogs/ferramentas observando o
nicho em 2026. Sem dados específicos de audiência brasileira.
```

## Veto Conditions

- Vetar a entrega se menos de 3 ângulos forem propostos, ou se qualquer ângulo for, na prática, um
  tema disfarçado (sem uma perspectiva emocional/estrutural distinta).
- Vetar a entrega se algum achado estiver sem fonte, data de acesso ou nível de confiança.

## Quality Criteria

- [ ] Entre 3 e 5 ângulos, cada um citando o padrão viral de origem.
- [ ] Toda afirmação sobre viralidade tem fonte, data e nível de confiança.
- [ ] Seção de gaps presente e honesta.
- [ ] Recomendação final é clara e justificada.

## Avança para

Pipeline Step 3 (checkpoint de Seleção do Ângulo).
