# Framework Operacional — Reels de Finanças com Aprovação

## Visão Geral do Fluxo

Pesquisa de padrões virais → Seleção de ângulo → Definição de tema/legenda → Aprovação de
conteúdo → Geração do vídeo (dry-run) → Revisão de qualidade → Aprovação final do vídeo →
Publicação.

O squad NUNCA escreve o roteiro completo do Reel nem gera a narração/vídeo em si — isso é
responsabilidade do `post_reel.py` (Gemini para o roteiro, XTTS v2 para narração, Remotion
para o render). O squad decide O QUÊ gerar (ângulo + tema) e QUANDO publicar (aprovação
humana), nunca reimplementando a geração de conteúdo que o CLI já faz.

## Definição de Ângulo

Um ângulo é a perspectiva emocional usada para abordar o tema do dia — não é o tema em si.
O mesmo tema de finanças ("cartão de crédito", "reserva de emergência", "investimentos")
produz Reels completamente diferentes dependendo do ângulo:

- **Erro/confissão numérica**: "Perdi R$X por Y meses até descobrir Z"
- **Aversão à perda**: "O que não fazer isso está te custando por mês"
- **Mito x realidade**: "X não te deixa rico. Y sim."
- **Comparação de cenário**: "Com salário de R$3.000, fazendo X, sobra R$Y mais"

CORRETO: 4 ângulos sobre o MESMO tema = 4 ganchos distintos.
ERRADO: 4 temas diferentes não são ângulos, são pautas distintas.

## Processo Passo a Passo

1. **Foco da pesquisa (checkpoint)**: usuário informa um nicho/tema do dia dentro de finanças
   pessoais, ou deixa em aberto para Victor Viral decidir com base no que está performando.
2. **Pesquisa de padrões (Victor Viral)**: busca Reels/vídeos virais recentes de finanças
   pessoais, extrai por que cada um viralizou (tipo de hook, estrutura, formato visual) e
   propõe 3-5 ângulos candidatos para o tema do dia, cada um com o padrão viral em que se
   baseia.
3. **Seleção do ângulo (checkpoint)**: usuário escolhe um dos ângulos propostos, ou pede nova
   pesquisa.
4. **Definição de tema e legenda (Ângela Ângulo)**: a partir do ângulo escolhido, define o
   tema específico (a string curta que vai para `post_reel.py`) e escreve uma prévia de
   legenda/hook, usando os princípios de copywriting (hook-first, especificidade, CTA).
5. **Aprovação de conteúdo (checkpoint)**: usuário aprova o tema e a prévia de legenda antes
   de gastar tempo renderizando o vídeo.
6. **Geração do vídeo — dry-run (Rafael Render)**: roda `post_reel.py --dry-run "{tema}"`,
   captura o caminho do vídeo gerado, a legenda real produzida pelo CLI e o roteiro salvo em
   `remotion-template/ultimo_roteiro.json`.
7. **Revisão de qualidade (Paula Parecer)**: avalia o roteiro/legenda realmente gerados contra
   os padrões virais (research-brief.md) e os critérios de qualidade do nicho, produzindo um
   veredito.
8. **Aprovação final do vídeo (checkpoint)**: usuário vê o caminho do vídeo, a legenda e o
   veredito de Paula, e decide: aprovar para postar, ou reprovar (volta para o passo 6 e
   gera o vídeo de novo com o mesmo tema já aprovado).
9. **Publicação (Rafael Render)**: só após a aprovação explícita do passo 8, roda
   `post_reel.py --video "{caminho}"`.

## Critérios de Decisão

- **Quando pular a pesquisa de novos ângulos**: nunca — mesmo quando o usuário já sabe o tema,
  Victor Viral ainda propõe o ângulo (a forma de contar), pois é isso que determina a
  performance do Reel, não o tema em si.
- **Quando reprovar no checkpoint final**: qualquer vídeo em que a legenda queimada, o hook
  ou a duração não correspondam ao que foi aprovado no passo 5, ou quando o veredito de Paula
  for REJECT.
- **Quando regenerar vs. redefinir tema**: se o problema é técnico (render, duração, áudio),
  volta para o passo 6 (mesmo tema). Se o problema é de conteúdo (ângulo não funcionou como
  esperado), o usuário deve reiniciar a partir do passo 3.
