# Análise de estilo — vídeo de referência (@ilustrandocuriosidades)

Fonte: `/home/vinycius/Downloads/snapinsta-1793398172080.mp4` (720x1280, 64.23s), analisado em
2026-10-30. Duas passadas: 18 frames esparsos (1 a cada 3.5s, visão geral) + análise completa do
vídeo inteiro em frames nativos (30fps), usando detecção de corte de cena (`ffmpeg ...,showinfo`)
pra achar os 8 pontos de transição reais e extrair contact sheets de alta resolução só onde
importa (±0.5s ao redor de cada corte, e 1fps dentro de cada cena parada). Frames temporários
apagados após a análise.

## Técnicas de texto (duas distintas, não uma só)

1. **Scramble/decode** — usada nos cards de título (barra preta) e em texto de atribuição
   (ex: "ZAHI HAWASS"). O texto começa como caracteres aleatórios tipo glitch ("7409", "4ΣB27",
   "HI HAWA"...) e resolve até travar no texto final em ~0.5–0.85s. Reaparece de saída, rapidinho,
   logo antes de cada corte de cena — usada como entrada E como transição, não só uma vez no
   início do vídeo.
2. **Reveal progressivo + puxão de foco** — usada nos cards de "abertura de capítulo" (título
   serifado dourado centralizado, sem barra preta, ex: "A RESSALVA"). O texto constrói letra por
   letra da esquerda pra direita ("A" → "AR" → "ARES" → "A RESSALVA") enquanto o fundo
   simultaneamente sai de desfocado pra nítido (rack focus). Efeito mais lento e cinematográfico
   que o scramble, reservado pra marcar virada de assunto.

## Transição entre cenas

3. **Corte seco com scramble de saída** — a maioria dos cortes entre imagens é hard cut, mas
   precedido pelo efeito de scramble no texto saindo (item 1), o que disfarça o corte seco.
4. **Fragmentação em cascata ("colagem")** — em pelo menos uma transição (papiro → mesa com
   tigelas, ~23–24s) a imagem de saída se fragmenta em várias cópias sobrepostas e
   semitransparentes que encolhem em cascata antes do corte — é o efeito mais próximo de
   "colagem" que o usuário pediu pra investigar, mas aparece raramente (1x em 8 cortes), não é
   o padrão dominante.

## Imagens e ilustrações

5. **Ken Burns constante** — zoom/pan lento e contínuo em toda imagem/foto parada, sem exceção.
6. **Ilustrações vetoriais animadas** — pelo menos um trecho (~45–48s, "NÃO ERA LIVRE") não é
   uma foto com Ken Burns, é uma ilustração estilo hieróglifo com a figura do trabalhador em
   pose mudando quadro a quadro — animação de verdade, não pan/zoom sobre imagem estática.
7. **Retrato circular com fade/scale-in simples** — para atribuição de fonte (foto do Zahi
   Hawass), sem scramble, só um fade+leve escala de entrada.
8. **Tratamento visual consistente** — grain/textura leve + luz sutil em todas as imagens,
   unificando fotos de origens diferentes.

## Estrutura e legendas

9. **Card reaproveitado pra tudo** — barra preta, linha principal branca negrito + linha
   secundária dourada menor. Usado tanto pra pontos de conteúdo quanto pros CTAs finais
   ("COMPARTILHA NO STORY", "SEGUE A PÁGINA"). Mesmo visual = CTA não parece anúncio plugado.
10. **Legendas ao vivo esparsas** — 2 a 4 palavras na tela por vez, fonte pequena, terço
    inferior, palavra atual em dourado, construindo a frase progressivamente. Oposto do bloco de
    frase inteira do pipeline atual. Provável maior fator de retenção de todos os itens.

## Prioridade de implementação (impacto estimado vs. esforço)

1. **Scramble/decode no texto** (item 1) — maior impacto visual, mais barato: 1 componente
   reutilizável (sorteia caracteres por frame, converge pro texto real), usado em todo texto de
   título/CTA que já existe hoje.
2. **Legenda esparsa** (item 10) — mudança de lógica de chunking das legendas, sem componente
   novo.
3. **Reveal progressivo + rack focus** (item 2) — segundo efeito de texto, menor prioridade que
   o scramble por aparecer só nos chapter titles (uso mais raro).
4. **Card de CTA reaproveitando template** (item 9) — já existe `CardScene.tsx`, é questão de
   reusar pro CTA final em vez de texto solto.
5. **Fragmentação em cascata** (item 4) e **ilustrações vetoriais animadas** (item 6) — maior
   esforço (exigem asset/técnica nova), impacto mais pontual. Deixar pra depois.

## Status

Análise completa do vídeo inteiro concluída em 2026-10-30. Usuário pediu pra prosseguir com
implementação sem pausar ("pode fazer tudo sem parar") — ver commits/mudanças subsequentes nesta
mesma data para o que foi efetivamente implementado a partir desta lista de prioridade.

Implementado e verificado visualmente (stills via `npx remotion still`) em 2026-10-30:
- Item 1 (scramble/decode) — `src/utils/text.tsx` (`ScrambleText`), usado em `IntroScene`,
  `CardScene` e `OutroScene`.
- Item 10 (legenda esparsa) — `KaraokeCaption` em `MotionReel.tsx`, chunking de 3 palavras.
- Item 2 (reveal progressivo + rack focus) — novo `src/scenes/ChapterScene.tsx` + novo tipo de
  cena `"chapter"` (`types.ts`, `SceneRouter`, prompt do Gemini em `gerar_motion.py`). Blur do
  fundo computado em `SceneBackdrop`.
- Item 9 (CTA reaproveitando template) — `OutroScene.tsx` reescrito pra usar o mesmo card
  translúcido de `CardScene` em vez de botão pill.
- Item 4 (fragmentação em cascata) — `SceneCrossfade` em `MotionReel.tsx` ganhou variante
  `"collage"`, aplicada em ~1 a cada 7 cortes (`i % 7 === 6`), fiel à raridade observada no
  vídeo de referência.

Não implementado (deixado pra depois, por falta de asset/técnica, não por falta de tempo):
- Item 6 (ilustrações vetoriais animadas) — exigiria gerar ou ter ilustrações estilo
  hieróglifo com variação de pose quadro a quadro; o pipeline atual só busca fotos (Pixabay)
  ou gera imagens estáticas (ComfyUI), não anima ilustrações. Fica fora de escopo até existir
  uma fonte desses assets.

## Correções após teste real do usuário (2026-10-30)

Usuário gerou um vídeo real (`reel --dry-run`, roteiro "A Verdade Sobre a Poupança") e rejeitou
o resultado por estar "bem distante da referência", apesar de todos os itens acima terem passado
em preview isolado. Comparação frame a frame contra o vídeo real revelou 3 problemas que a
preview isolada (fixture de 8 cenas, frames escolhidos a dedo) não pegou:

1. **Crossfade com dupla exposição de texto** — `SceneCrossfade` fazia um crossfade de opacidade
   cheia (fundo E texto) em TODO corte, não só na variante colagem, mostrando por ~10 frames duas
   legendas grandes e legíveis sobrepostas. Contradiz o item 3 (corte seco disfarçado por scramble,
   nunca duas legendas legíveis juntas). Corrigido: variante "fade" agora é corte seco de verdade
   (sem Sequence estendida, sem interpolação de opacidade); só a variante "collage" mantém overlap.
2. **Colagem nunca aparecia em vídeo real** — o gatilho era `i % 7 === 6`, só verdadeiro a partir
   da 7ª cena; a maioria dos roteiros reais tem ≤6-8 cenas (este tinha 6), então o efeito nunca
   disparava fora da fixture de preview (que tinha 8 cenas só pra isso). Corrigido: índice de corte
   escolhido por hash determinístico do título (`hashString(script.title) % numCuts`), garante
   exatamente 1 colagem por vídeo sempre que há pelo menos 1 corte.
3. **Imagens do Pixabay sem relação com a cena** — `imagePrompts` era um pool genérico de 5-8
   descrições sobre o TEMA do vídeo, gerado uma vez e depois ciclado (`itertools.cycle`) pelas
   cenas sem nenhuma relação com o conteúdo de cada cena específica. O scorer de relevância
   (`_pixabay_relevancia`) já escolhe bem o melhor resultado para a busca recebida, mas a busca em
   si nunca era sobre a cena certa. Corrigido: Gemini agora gera 1 `imagePrompt` por cena, na mesma
   ordem (alinhado 1:1), descrevendo o conteúdo específico daquela cena — não o tema geral.
   Limitação conhecida, não resolvida: a API do Pixabay não expõe metadado de "tem overlay/
   timecode queimado no vídeo" — um asset com esse defeito visual (ex: cronômetro com
   "00:00:06:00" na tela) pode ainda ser escolhido mesmo com busca/relevância corretas, porque
   nenhum QA automático hoje analisa o conteúdo visual do vídeo baixado.

Fixes 1 e 2 verificados via `npx remotion still` contra o roteiro real (`ultimo_roteiro.json` +
imagens já baixadas em `public/images/`), nos frames de corte reais do vídeo gerado: corte seco
sem sobreposição de texto confirmado (frames 205/210/215), colagem dispara e resolve limpa sem
fragmentos residuais (frames 445/455/465). Fix 3 requer nova geração (`reel --dry-run`) pra
verificar, já que depende da resposta do Gemini.

## Segunda rodada: usuário testou de novo e ainda estava ruim (2026-10-30)

Usuário gerou outro vídeo real (`motion_20261030_194005`, roteiro "Renda Passiva") já com os 3
fixes acima aplicados, e rejeitou de novo ("tudo muito ruim": estilo de texto, imagens sem nexo,
edição em geral). Varredura de frame a frame do vídeo inteiro (1 frame/segundo, visão de
primeira vez, não frames escolhidos a dedo) achou 2 bugs estruturais que a lista de 3 itens
anterior não cobria — eram maiores que qualquer um dos 3 itens já corrigidos:

4. **`HighlightScene` com texto gigante tomando a tela** — `fontSize: 80` fixo, sem relação com
   o tamanho da frase. O campo `highlight.text` do Gemini na prática costuma ser uma frase
   inteira (10-13+ palavras), não uma expressão curta tipo "juros compostos" — vira um bloco de
   5-6 linhas cobrindo quase a tela toda. Corrigido em `HighlightScene.tsx`: `fontSize` agora é
   calculado a partir do comprimento total do texto (heurística linear, 80px pra textos curtos,
   reduz até 36px pra frases longas — ver comentário `shortcut:` no código).
5. **Legenda ao vivo duplicando o texto do `HighlightScene`** — `KaraokeCaption` em
   `MotionReel.tsx` renderizava incondicionalmente pra toda cena com `scene.words`, inclusive
   `highlight`, que já mostra a frase inteira construída palavra por palavra na tela. Resultado:
   o mesmo conteúdo narrado duas vezes ao mesmo tempo, em dois componentes de texto diferentes,
   sobrepostos. Corrigido: `KaraokeCaption` agora pula `scene.type === "highlight"` (continua
   normal nos outros tipos, onde ela complementa um texto curto/estático, não duplica).

Verificado via `npx remotion still` contra `ultimo_roteiro.json` (cena highlight de 13 palavras,
o pior caso real disponível): frame 195 (frase já estabilizada) mostra o texto em 3 linhas
legíveis, sem estourar a tela, e sem legenda duplicada embaixo.

Também identificado nessa rodada, causa raiz do item 3 (imagens sem nexo) só parcialmente
resolvido: ao reescrever o exemplo de `imagePrompts` no `SYSTEM_PROMPT` pra demonstrar o
alinhamento 1 prompt = 1 cena, usei sem querer linguagem metafórica ("to symbolize lost value"),
que o Gemini imitou na geração seguinte — busca de banco de imagens não entende metáfora, então
voltou foto de batata-doce pra ilustrar "dinheiro crescendo". Corrigido: regra explícita contra
metáfora/símbolo no `SYSTEM_PROMPT` + exemplo reescrito 100% literal. Esse fix (e o item 3
original) só são verificáveis numa geração nova, porque dependem da resposta do Gemini.

Não investigado nessa rodada (menor prioridade, não bloqueia): inconsistência de maiúsculas
("FIIs" em vez de "FIIS", itens de lista em minúsculas apesar da regra do prompt pedir
maiúsculas) — variação do Gemini, não um bug de código.

## Terceira rodada: causa raiz real do item 3 (imagens sem nexo) — busca por keyword, não geração (2026-10-30)

Com 1 `imagePrompt` por cena e linguagem literal (fixes da rodada anterior) já corretos, o
vídeo gerado (`motion_20261030_201103`) continuava trazendo imagem errada em 2 de 5 cenas
(dente-de-leão+sobremesa pra "renda passiva", celular antigo BlackBerry pra "fundos
imobiliários"). Causa raiz isolada testando a API do Pixabay direto (fora do pipeline):

- `_pixabay_fallback` buscava com a frase inteira do `imagePrompt` (10+ palavras, já cortada
  no primeiro `,` mas ainda uma frase em inglês com stopwords tipo "with"/"while"). A busca do
  Pixabay não entende frase — é correspondência por palavra solta, e palavras comuns da frase
  (ex. "table", "on") dominam a classificação de relevância deles, trazendo maçã/livro/gato em
  vez de moeda. `_pixabay_keywords()` (função nova) reduz a frase a 4 palavras-chave concretas
  (sem stopword, sem repetição) antes de buscar — `gerar_motion.py:913-930`.
- Mesmo com keywords boas, a query ainda perdia pra fotos genéricas tipo "wallpaper de
  celular" quando a cena em si é abstrata (ex. "notificação de dividendo no app do banco" não
  tem um objeto visual óbvio). Corrigido ancorando toda busca do Pixabay com `"finance money"`
  no final (pipeline é só pra finanças pessoais, ver CLAUDE.md) — `gerar_motion.py:633`.
  Testado manualmente contra a API real: a mesma cena que antes voltava maçã/livro passou a
  voltar moeda/gráfico de ações.
- Terceiro problema, mais sutil: `_pixabay_relevancia` pontua por fração de palavras batidas
  (poucos valores possíveis pra uma query curta), então empates são comuns. `max()` do Python
  em empate fica com o PRIMEIRO candidato da lista (ordem de retorno do Pixabay), não o
  melhor — e fotos genéricas de "celular/tela" (tags amplas, aparecem cedo na ordenação deles)
  ganhavam o empate contra a foto de finanças de verdade que batia no mesmo score. Corrigido
  com bônus de desempate (+0.001 por palavra-âncora presente nas tags do candidato) em
  `_pixabay_relevancia` — não muda a ordem entre scores diferentes, só resolve empate a favor
  do candidato mais alinhado ao tema. Verificado contra a API real (cena do card "SEU SALÁRIO
  / DIVIDENDOS"): antes do fix, foto genérica de celular vencia um empate 0.333 contra uma
  foto de forex/trading que batia no mesmo score; depois do fix, a foto de forex vence.

Resultado após os 2 primeiros fixes (`motion_20261030_202121`, antes do fix de desempate):
intro/highlight/chapter/outro melhoraram bastante (ex. cena de lista foi de "celular BlackBerry
antigo" pra "moedas empilhadas + planta crescendo", match quase perfeito), mas a cena de card
ainda caiu no problema de empate acima.

**Validação do fix de desempate** (`motion_20261030_202734`, tema "renda passiva", 5 cenas):
revisão quadro a quadro (1fps) confirmou o fix funcionando. A cena de card ("DIVIDENDOS / TODO
MÊS", prompt "laptop com gráfico de dividendos na tela") — a mesma que travou DUAS gerações
seguidas no celular antigo/símbolo § — agora traz uma nota de dólar em close-up, imagem
genuinamente de finanças em vez do stock genérico de celular/tela. Demais cenas também boas:
intro (pessoa em café, texto "VIVER DE RENDA" correto), highlight (mãos digitando em laptop,
match com "ganhar dinheiro sem trabalhar"), list (prédios/skyline, match com
imóveis/ações/dividendos), outro (moedas + planta crescendo, igual ao padrão já validado).
Texto do ScrambleText no outro ("QUER APRENDEEΦ" num frame, resolvendo pra "QUER APRENDER?" no
frame seguinte) é a animação de scramble normal pegando no meio da resolução — falso alarme,
mesmo padrão já confirmado nas rodadas anteriores, não é bug.

Com os 2 fixes desta rodada, os 3 problemas de imagem sem nexo identificados nas rodadas
anteriores (frase diluindo a busca, ausência de âncora temática, empate favorecendo foto
genérica) estão resolvidos e validados ponta a ponta num vídeo real. Nenhum problema novo de
imagem encontrado nesta geração.

## Quarta rodada: legenda estática ainda vazava na cena highlight (2026-10-30)

Revendo `motion_20261030_202734` quadro a quadro, a cena highlight ("O SEGREDO É GANHAR
DINHEIRO SEM TRABALHAR") mostrava um bloco de legenda extra embaixo ("ISSO NÃO É FÓRMULA
MÁGICA, É RENDA PASSIVA.") — texto diferente do highlight (vem do `_caption`/narração real,
não do `highlight.text`), mas reintroduzindo exatamente o "bloco de frase inteira" que o item
10 do guia de estilo queria eliminar, bem na cena pensada pra ter só um headline limpo.

Causa: o fix da segunda rodada (`scene.type !== "highlight" && scene.words...`) só pulava o
braço `if` (`KaraokeCaption`, legenda esparsa palavra-a-palavra). Como a cena highlight tem
`words` preenchido, cair fora do `if` por causa do `type !== "highlight"` ser falso jogava pro
`else if (scene.caption)`, que renderiza a legenda ESTÁTICA em bloco único
(`MotionReel.tsx:346`) — sem checagem de tipo nenhuma. Corrigido adicionando a mesma condição
`scene.type !== "highlight"` no `else if` (`MotionReel.tsx:346`), pulando as duas variantes de
legenda nessa cena, não só o karaokê.

Verificado via `npx remotion still` contra o fixture `demoScript` (que tem `caption` E `words`
preenchidos na cena highlight, pior caso pra essa checagem): frame 150 não mostra mais nenhuma
legenda embaixo do headline, só o texto grande. Esse bug existia desde a segunda rodada e
afetava toda cena highlight gerada desde então — não é novo, só não tinha sido pego porque as
revisões anteriores focaram nas imagens, não notaram o texto extra embaixo.

**Validação em vídeo real** (`motion_20261030_203646`, tema "aposentadoria", 6 cenas incl.
chapter): revisão quadro a quadro completa. Cena highlight ("O INSS NÃO VAI PAGAR O SEU ESTILO
DE VIDA") confirmada sem legenda duplicada embaixo — só o texto grande, fix validado em vídeo
de verdade. Imagens do Pixabay continuam boas em todas as 6 cenas, inclusive num tema diferente
do usado pra validar a terceira rodada: mulher pensativa na janela (intro), café+gráfico (card
"SEU SALÁRIO HOJE"), cofrinho+coroa+moeda (chapter "A SOLUÇÃO É INVESTIR"), casal de idosos
sorrindo (outro "GARANTA SEU FUTURO" — particularmente bom encaixe temático pra
aposentadoria). Nenhuma imagem sem nexo encontrada.

Problema novo e menor encontrado, não corrigido: o título da intro saiu do Gemini como
`"OFUTURO DA SUA APOSENTADORIA"` (sem espaço entre "O" e "FUTURO") — confirmado no
`ultimo_roteiro.json` bruto, então é variação de geração do Gemini, não bug de
render/código (mesma classe do problema de capitalização "FIIs" já registrado como não
bloqueante). Não investigado mais a fundo — point de atenção pra próximas rodadas se o padrão
se repetir.

## Resumo do estado atual (fim da sessão de 2026-10-30)

Todos os itens de prioridade alta/média do guia de estilo (scramble, legenda esparsa, reveal+
rack focus do chapter, CTA reaproveitando card, colagem rara) e os 4 bugs estruturais achados
em geração real (crossfade com dupla exposição, colagem nunca disparando, imagens sem nexo —
3 causas raiz diferentes, legenda duplicada no highlight) estão implementados e validados em
vídeo real, não só em preview isolada. Only item pendente do guia original é o item 6
(ilustrações vetoriais animadas), fora de escopo por falta de fonte de assets. Dois problemas
cosméticos menores e não bloqueantes (capitalização inconsistente do Gemini, espaço faltando
num título) ficam registrados mas não corrigidos — são variação de LLM, não bug de pipeline.
