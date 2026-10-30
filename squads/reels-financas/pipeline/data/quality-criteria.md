# Critérios de Qualidade — Reels de Finanças com Aprovação

## Rubrica de Revisão (Paula Parecer)

Cada critério é avaliado de 1 a 10. Veredito segue a mesma regra do best-practice de review:

- **APROVAR** se a média geral for >= 7/10 E nenhum critério individual abaixo de 4/10.
- **APROVAR COM RESSALVAS** se a média for >= 7/10 mas algum critério não-crítico ficar entre
  4-6/10.
- **REJEITAR** se a média for < 7/10 OU qualquer critério estiver abaixo de 4/10.

| Critério | O que avalia |
|---|---|
| Hook (0-2s) | O hook falado/legenda inicial entrega um número, um erro nomeado ou uma contradição nos primeiros segundos — não é genérico ("hoje vou falar sobre..."). |
| Alinhamento com o ângulo aprovado | O roteiro realmente gerado pelo post_reel.py reflete o ângulo escolhido no checkpoint 3 (ex: se o ângulo era "erro/confissão", o roteiro precisa confessar um erro concreto, não só dar dica genérica). |
| Especificidade | Presença de números, valores em R$, prazos ou situações concretas — não afirmações vagas tipo "isso vai te ajudar a economizar". |
| CTA | Existe uma chamada para ação específica no fim (seguir, comentar, salvar) — não "espero que tenha gostado". |
| Duração e ritmo | Compatível com a faixa 15-30s recomendada para Reels (`_opensquad/core/best-practices/instagram-reels.md`), sem introdução lenta antes do hook. |
| Legenda do post | A legenda (caption) gerada pelo post_reel.py front-loada o valor nos primeiros ~125 caracteres visíveis. |

## Limites Rígidos (Hard Rejection Triggers)

- Qualquer critério abaixo de 4/10 rejeita o vídeo independente da média.
- Roteiro que não corresponde ao ângulo aprovado no checkpoint 3 é rejeição automática —
  mesmo com boa qualidade de escrita, se o ângulo mudou sem passar por novo checkpoint, não é
  aprovável.
- Mais de 3 ciclos de rejeição no mesmo tema: escalar para o usuário decidir manualmente em
  vez de regenerar indefinidamente.

## Critérios de Pesquisa (Victor Viral)

- Cada ângulo proposto precisa citar o padrão viral em que se baseia (ex: "hook de número",
  "aversão à perda") e, quando possível, um exemplo real encontrado na pesquisa.
- Mínimo de 3 ângulos candidatos, máximo de 5, para não sobrecarregar a escolha do usuário.
- Fontes de baixa confiança (blog único, sem corroboração) devem ser marcadas como tal, não
  apresentadas como fato estabelecido.
