# Anti-Patterns — Reels de Finanças com Aprovação

## Pesquisa (Victor Viral)

- **Propor ângulos sem citar o padrão viral de origem** — um ângulo sem justificativa é só um
  palpite. Sempre citar de onde veio o padrão (hook de número, aversão à perda, etc.).
- **Confundir tema com ângulo** — "investimentos" não é um ângulo, é um tema. Cinco temas
  diferentes não são cinco ângulos.
- **Apresentar fonte única como fato estabelecido** — marcar confiança média/baixa quando só
  há uma fonte não corroborada.

## Definição de Tema/Legenda (Ângela Ângulo)

- **Escrever o roteiro completo do Reel** — essa é tarefa do Gemini dentro do post_reel.py.
  Ângela define tema + prévia de legenda, nunca o roteiro cena a cena.
- **Ignorar o ângulo aprovado no checkpoint** — se o usuário escolheu "aversão à perda", o
  tema e a legenda não podem migrar silenciosamente para um ângulo aspiracional.
- **Legenda sem hook nos primeiros 125 caracteres** — se o valor só aparece depois do
  "...mais", a legenda falhou no objetivo.

## Geração e Publicação (Rafael Render)

- **Rodar `--video` sem checkpoint de aprovação final confirmado** — a ordem geração →
  revisão → aprovação → publicação é inviolável; nunca pular a aprovação humana.
- **Reimplementar geração de roteiro/narração/render** — toda essa lógica já existe em
  `post_reel.py`; o agente só invoca o CLI, nunca duplica a lógica internamente.
- **Descartar o vídeo em caso de falha de publicação** — se `post_reel.py --video` falhar, o
  arquivo mp4 continua disponível; reportar o caminho, nunca apagar ou perder a referência.

## Revisão (Paula Parecer)

- **Aprovar sem ler o roteiro real gerado** — avaliar só a legenda e ignorar
  `remotion-template/ultimo_roteiro.json` é revisão incompleta.
- **Média alta mascarando um critério crítico** — um critério abaixo de 4/10 rejeita mesmo
  com média geral alta; nunca "compensar" um critério ruim com os outros.
- **Feedback vago** — "o hook podia ser melhor" sem dizer o quê, onde e como corrigir não é
  uma revisão útil.
