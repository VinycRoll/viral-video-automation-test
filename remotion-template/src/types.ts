export type SceneType =
  | "intro"
  | "text"
  | "card"
  | "list"
  | "highlight"
  | "code"
  | "chapter"
  | "proof"
  | "growth"
  | "notification"
  | "calendar"
  | "clock"
  | "moneystack"
  | "checklist"
  | "progress"
  | "timer"
  | "rating"
  | "scale"
  | "map"
  | "weather"
  | "achievement"
  | "battery"
  | "book"
  | "thermometer"
  | "piggybank"
  | "receipt"
  | "roadmap"
  | "quote"
  | "alert"
  | "split"
  | "counter"
  | "sizecompare"
  | "xray"
  | "proportiongrid"
  | "speedrace"
  | "timelineera"
  | "orbit"
  | "dna"
  | "mythfact"
  | "redacted"
  | "magnify"
  | "censored"
  | "domino"
  | "treebranch"
  | "vsbattle"
  | "outro";

export interface WordTiming {
  text: string;
  start: number; // segundos, relativo ao início do áudio da cena
  end: number;
}

export interface Scene {
  type: SceneType;
  duration: number;       // segundos
  audio?: string;         // caminho .mp3 da narração (não usado — mix via ffmpeg)
  caption?: string;       // texto da narração para exibir como legenda na tela
  captionFrames?: number; // duração real do áudio em frames (para sincronizar legenda)
  words?: WordTiming[];   // timing real por palavra (via Kokoro) para a legenda karaokê
  backgroundImage?: string; // caminho relativo em public/ (ex: "images/00.png") — Ken Burns automático

  // intro / outro / chapter
  title?: string;
  subtitle?: string;
  channel?: string;
  cta?: string;

  // text / highlight  — suporta **branco bold** e *amarelo*
  text?: string;

  // card
  cardTitle?: string;
  cardValue?: string;
  cardNote?: string;

  // list
  items?: string[];

  // proof — card com barras reais (ex: divisão 50/30/20 do salário), sem foto de fundo
  proofTitle?: string;
  proofBars?: { label: string; value: string; pct: number }[];

  // growth — linha de crescimento (patrimônio) desenhada ao vivo, com bifurcação e
  // contadores opcionais, sem foto de fundo (estilo motionmaxxing). Pontos em 0-100
  // (x: progresso no tempo, y: valor — 0 = base, 100 = topo do gráfico).
  growthTitle?: string;
  growthPoints?: { x: number; y: number }[];
  growthTurnIndex?: number;   // índice em growthPoints onde a linha vira de cinza (estagnada) pra accent (crescendo)
  growthForkPoints?: { x: number; y: number }[]; // 2º ramo saindo do último ponto de growthPoints (bifurcação)
  growthCounters?: { to: number; prefix?: string; suffix?: string; label?: string; accent?: boolean }[];

  // code
  code?: string;
  language?: string;

  // notification — notificação de app sobre lock screen (estilo native-ui/motionmaxxing),
  // sem foto de fundo. Use raramente (no máx. 1 cena por roteiro) pra variar o visual.
  // App/remetente/frase são fictícios e adaptados ao nicho (ex: finanças, culinária, saúde).
  notifAppLetter?: string;   // 1-2 letras do ícone do app (ex: "IN")
  notifAppColor?: string;    // gradiente CSS do ícone (ex: "linear-gradient(180deg,#8a7cff,#4636d9)")
  notifTitle?: string;       // remetente/assunto (ex: "Investe App")
  notifBody?: string;        // frase real da notificação, sem markdown
  notifTime?: string;        // ex: "agora"
  notifOlderTitle?: string;  // 2ª notificação, empilhada acima (opcional)
  notifOlderBody?: string;
  notifOlderTime?: string;
  lockTime?: string;         // relógio da lock screen, ex: "9:41"
  lockDate?: string;         // ex: "Segunda, 10 de março"
  wallpaper?: string;        // gradiente CSS de fundo da lock screen

  // calendar — card de calendário de mesa (estilo native-ui), sem foto de fundo. Use
  // quando o roteiro menciona uma DATA, PRAZO ou EVENTO específico (ex: "dia do pagamento",
  // "prazo do IR", "aniversário de 1 ano investindo").
  calendarMonth?: string;    // ex: "MARÇO" (maiúsculo)
  calendarWeekday?: string;  // ex: "SEXTA-FEIRA" (opcional)
  calendarDay?: string;      // ex: "15"
  calendarNote?: string;     // legenda abaixo do card, ex: "dia do pagamento"

  // clock — relógio digital ou analógico, sem foto de fundo. Use quando o roteiro
  // menciona um HORÁRIO específico ou a passagem de um tempo do dia (ex: "às 7 da manhã",
  // "2 minutos", "antes de dormir").
  clockType?: "digital" | "analog"; // padrão: "digital"
  clockTime?: string;        // "HH:MM", ex: "07:30"
  clockNote?: string;        // legenda abaixo do relógio

  // moneystack — pilha de notas de dinheiro crescendo, sem foto de fundo. Use quando o
  // roteiro fala de dinheiro/patrimônio/economia CRESCENDO ou se ACUMULANDO (diferente
  // de "growth", que é uma linha de gráfico — moneystack é mais literal/concreto).
  moneyValue?: string;       // valor final, ex: "R$ 1.247"
  moneyNote?: string;        // legenda abaixo, ex: "em 6 meses"
  moneyBills?: number;       // nº de notas na pilha (padrão 6, máx. ~8)

  // checklist — lista de tarefas marcando check uma a uma, sem foto de fundo. Use quando
  // o roteiro descreve um PASSO A PASSO ou uma lista de ações concretas (ex: "checklist
  // antes de investir", "3 coisas pra revisar hoje").
  checklistTitle?: string;   // título curto do card (opcional)
  checklistItems?: string[]; // 3-5 itens curtos, marcam check em sequência

  // progress — anel de progresso enchendo até uma porcentagem, com contador no centro,
  // sem foto de fundo. Use quando o roteiro menciona uma META, PERCENTUAL ou PROGRESSO
  // em direção a algo (ex: "73% das pessoas", "você já fez metade do caminho").
  progressPct?: number;      // 0-100, valor final do anel
  progressLabel?: string;    // texto curto acima do anel (opcional)
  progressNote?: string;     // legenda abaixo do anel

  // timer — cronômetro regressivo com anel se esvaziando, sem foto de fundo. Use quando
  // o roteiro menciona um tempo/prazo curto e concreto (ex: "separe 10 minutos",
  // "em 30 segundos", "2 minutos por dia").
  timerFrom?: string;        // "MM:SS" valor inicial, ex: "10:00"
  timerTo?: string;          // "MM:SS" valor final (padrão "0:00")
  timerLabel?: string;       // texto curto acima do anel (opcional)
  timerNote?: string;        // legenda abaixo do anel

  // rating — 5 estrelas "pipocando" em sequência revelando a nota, sem foto de fundo.
  // Use quando o roteiro cita uma nota, avaliação ou aprovação (ex: "nota 4.8",
  // "a maioria aprova isso").
  ratingValue?: number;      // 0-5 (decimais permitidos, ex: 4.8)
  ratingLabel?: string;      // texto curto acima das estrelas (opcional)
  ratingNote?: string;       // legenda abaixo, ex: "MAIS DE 10 MIL AVALIAÇÕES"

  // scale — balança de dois pratos pendendo pro lado vencedor, sem foto de fundo. Use
  // quando o roteiro faz uma COMPARAÇÃO direta entre duas opções (ex: "alugar ou
  // financiar", "risco vs retorno").
  scaleLabel?: string;       // texto curto acima da balança (opcional)
  scaleLeftLabel?: string;   // ex: "ALUGAR"
  scaleLeftValue?: string;   // valor curto no prato, ex: "R$ 1.200/mês"
  scaleRightLabel?: string;  // ex: "FINANCIAR"
  scaleRightValue?: string;  // valor curto no prato, ex: "R$ 2.100/mês"
  scaleWinner?: "left" | "right"; // qual lado pende (vence a comparação)
  scaleNote?: string;        // legenda abaixo

  // map — mapa estilizado (grade de pontos) com um pin caindo e radar pulsando, sem foto
  // de fundo real. Use quando o roteiro menciona um LOCAL ou abrangência geográfica
  // (ex: "em qualquer lugar do Brasil", "perto de você").
  mapLabel?: string;         // texto curto acima do card (opcional)
  mapPinLabel?: string;      // texto curto sob o pin, ex: "SÃO PAULO" (opcional)
  mapNote?: string;          // legenda abaixo do card

  // weather — ícone de clima animado (sol/nublado/chuva), sem foto de fundo. Use quando o
  // roteiro usa uma METÁFORA de clima/tempo (ex: "nem todo dia é dia de sol", "se prepare
  // pra qualquer cenário").
  weatherType?: "sunny" | "cloudy" | "rainy"; // padrão "sunny"
  weatherTemp?: string;      // opcional, ex: "28°"
  weatherLabel?: string;     // texto curto acima do ícone (opcional)
  weatherNote?: string;      // legenda abaixo

  // achievement — badge/medalha "pipocando" com burst e fitas, sem foto de fundo. Use
  // quando o roteiro cita uma meta batida, marco ou conquista desbloqueada (ex: "primeiro
  // mil guardado", "meta do mês batida").
  achievementLabel?: string; // texto curto acima do badge (opcional)
  achievementTitle?: string; // texto dentro/abaixo do badge, ex: "PRIMEIRO MIL"
  achievementNote?: string;  // legenda abaixo

  // battery — bateria enchendo de baixo pra cima, sem foto de fundo. Use quando o roteiro
  // fala de energia/reserva se acumulando aos poucos (diferente de "progress", que é um
  // anel — battery é mais literal, tipo "carregar aos poucos").
  batteryPct?: number;       // 0-100, valor final
  batteryLabel?: string;     // texto curto acima (opcional)
  batteryNote?: string;      // legenda abaixo

  // book — livro fechado que abre revelando o título, sem foto de fundo. Use quando o
  // roteiro fala de aprendizado ou educação financeira (ex: "estude antes de investir").
  bookTitle?: string;        // título na página revelada, ex: "EDUCAÇÃO FINANCEIRA"
  bookLabel?: string;        // texto curto acima do livro (opcional)
  bookNote?: string;         // legenda abaixo

  // thermometer — termômetro enchendo de baixo pra cima, sem foto de fundo. Use para
  // NÍVEL ou INTENSIDADE (ex: "nível de risco desse investimento", "quanto falta pra
  // bater sua meta") — diferente de "battery" (energia/reserva) e "progress" (anel).
  thermoPct?: number;        // 0-100, valor final
  thermoLabel?: string;      // texto curto acima (opcional)
  thermoNote?: string;       // legenda abaixo

  // piggybank — moedas caindo num pote de vidro até formar um valor, sem foto de fundo.
  // Use quando o roteiro fala de ECONOMIZAR/GUARDAR dinheiro pouco a pouco (mais literal
  // que "moneystack", que empilha notas).
  piggyValue?: string;       // valor final, ex: "R$ 500"
  piggyLabel?: string;       // texto curto acima (opcional)
  piggyNote?: string;        // legenda abaixo, ex: "em 3 meses"
  piggyCoins?: number;       // nº de moedas (padrão 5, máx. 8)

  // receipt — recibo com itens somando um total em destaque, sem foto de fundo. Use
  // quando o roteiro DETALHA gastos/itens que compõem um valor (ex: "pra onde vai seu
  // salário"), diferente de "proof" (barras de % de divisão).
  receiptTitle?: string;     // título do recibo (opcional)
  receiptItems?: { label: string; value: string }[]; // 3-5 itens
  receiptTotal?: string;     // valor total, destacado na cor do vídeo
  receiptNote?: string;      // legenda abaixo

  // roadmap — linha do tempo horizontal com 3-4 marcos acendendo em sequência, sem foto
  // de fundo. Use para uma JORNADA ou PLANO em etapas (ex: "sua reserva em 3 passos"),
  // diferente de "checklist" (tarefas marcando check uma a uma).
  roadmapTitle?: string;     // título curto acima (opcional)
  roadmapSteps?: { label: string }[]; // 3-4 marcos, label curto
  roadmapNote?: string;      // legenda abaixo

  // quote — citação editorial com aspas grandes, sem foto de fundo. Use quando o roteiro
  // cita uma frase de autoridade ou dado curto pra reforçar o argumento.
  quoteText?: string;        // a frase (sem aspas, o componente já adiciona)
  quoteAuthor?: string;      // ex: "Warren Buffett" (opcional)

  // alert — triângulo de alerta pulsando em vermelho, sem foto de fundo. Use quando o
  // roteiro aponta um ERRO COMUM ou RISCO a evitar — tom de advertência.
  alertLabel?: string;       // texto curto acima, ex: "ATENÇÃO" (opcional)
  alertTitle?: string;       // a mensagem de alerta principal
  alertNote?: string;        // legenda abaixo

  // split — dois valores lado a lado com divisória central, sem foto de fundo. Use para
  // comparar dois ESTADOS/MOMENTOS (ex: "antes e depois da reserva") sem indicar
  // vencedor — diferente de "scale", que faz a balança pender pra um lado.
  splitLabel?: string;       // texto curto acima (opcional)
  splitLeftLabel?: string;
  splitLeftValue?: string;
  splitRightLabel?: string;
  splitRightValue?: string;  // lado direito é sempre destacado na cor do vídeo
  splitNote?: string;        // legenda abaixo

  // counter — número gigante contando até um valor, sem ícone, sem foto de fundo. Use
  // pra uma ESTATÍSTICA de impacto pura (ex: "87% das pessoas", "+10 mil investidores"),
  // quando o dado em si já é o choque, sem precisar de um elemento visual concreto.
  counterTo?: number;        // valor final
  counterPrefix?: string;    // ex: "+" ou "R$ " (opcional)
  counterSuffix?: string;    // ex: "%" ou " mil" (opcional)
  counterLabel?: string;     // texto curto acima (opcional)
  counterNote?: string;      // legenda abaixo

  // sizecompare — dois elementos lado a lado em escalas muito diferentes, com zoom-out
  // revelando a diferença de tamanho. Use pra fatos de ESCALA/TAMANHO (ex: comparar o
  // tamanho de dois objetos, animais, prédios).
  sizeLabel?: string;
  sizeLeftLabel?: string;
  sizeLeftValue?: string;
  sizeRightLabel?: string;
  sizeRightValue?: string;
  sizeRatio?: number;        // quantas vezes o lado direito é maior que o esquerdo (padrão 20)
  sizeNote?: string;

  // xray — um scanner/lente passa sobre um ícone revelando uma camada "interna" diferente.
  // Use pra explicar COMO ALGO FUNCIONA POR DENTRO.
  xrayLabel?: string;
  xrayOutside?: string;      // rótulo do lado ainda não escaneado
  xrayInside?: string;       // rótulo do lado revelado
  xrayNote?: string;

  // proportiongrid — grade de ícones onde só uma fração acende, pra ilustrar estatística.
  // Use pra proporções do tipo "X em cada Y".
  gridLabel?: string;
  gridTotal?: number;        // total de ícones na grade (padrão 100)
  gridHighlight?: number;    // quantos acendem na cor do vídeo
  gridNote?: string;

  // speedrace — 2-3 barras cruzando a tela em velocidades diferentes. Use pra comparar a
  // RAPIDEZ de coisas distintas (ex: som vs. luz).
  raceLabel?: string;
  raceItems?: { label: string; value?: string; speed: number }[]; // speed relativo, maior = mais rápido
  raceNote?: string;

  // timelineera — régua temporal horizontal deslizando com inércia até parar numa data.
  // Use pra uma data ou período histórico específico.
  eraLabel?: string;
  eraFrom?: number;          // ano inicial da régua
  eraTo?: number;            // ano onde a régua para
  eraNote?: string;

  // orbit — núcleo central com 2-3 elementos orbitando. Use pra conceitos CENTRAIS com
  // coisas girando em torno (planetas, átomo, ideias que giram em torno de um tema).
  orbitLabel?: string;
  orbitCenterLabel?: string; // texto curto no núcleo
  orbitItems?: { label: string }[]; // 2-3 itens orbitando
  orbitNote?: string;

  // dna — hélice dupla estilizada girando suavemente. Curinga pra biologia, saúde,
  // genética, evolução.
  dnaLabel?: string;
  dnaNote?: string;

  // mythfact — afirmação recebe carimbo "FALSO" e vira revelando a verdade em verde. Use
  // pra desmentir um mito comum sobre o tema.
  mythLabel?: string;        // o mito/afirmação falsa
  factLabel?: string;        // a verdade revelada
  mythNote?: string;

  // redacted — documento com tarjas pretas que deslizam revelando uma palavra escondida.
  // Use pra um "segredo"/informação pouco conhecida sobre o tema.
  redactedTitle?: string;    // ex: "ARQUIVO CONFIDENCIAL"
  redactedWord?: string;     // palavra revelada
  redactedNote?: string;

  // magnify — lupa que passeia pela tela até focar e ampliar um detalhe escondido. Use
  // pra revelar um detalhe pouco notado sobre o tema.
  magnifyLabel?: string;
  magnifyTitle?: string;     // texto revelado em foco
  magnifyNote?: string;

  // censored — texto/valor borrado ou pixelado que fica nítido. Use pra criar suspense
  // antes de revelar um número ou fato.
  censoredLabel?: string;
  censoredText?: string;     // o texto/valor que começa borrado e revela nítido
  censoredNote?: string;

  // domino — fileira de blocos que tombam em cadeia. Use pra ilustrar causa-e-efeito (um
  // evento pequeno causando uma consequência grande).
  dominoLabel?: string;
  dominoCount?: number;      // nº de blocos (padrão 6)
  dominoNote?: string;

  // treebranch — linha única que sobe e se bifurca em vários ramos. Use pra mostrar como
  // uma coisa deu origem a várias outras (língua, espécie, invenção).
  treeLabel?: string;
  treeRootLabel?: string;    // nó raiz
  treeBranches?: { label: string }[]; // 2-4 ramos
  treeNote?: string;

  // vsbattle — duas metades colidem na diagonal com emblema "VS" pulsante. Use pra
  // comparar dois animais, países ou fenômenos — mais "confronto" que "split" (que é
  // uma comparação passiva lado a lado).
  vsLeftLabel?: string;
  vsLeftValue?: string;
  vsRightLabel?: string;
  vsRightValue?: string;
  vsNote?: string;
}

export interface VideoScript {
  title: string;
  accentColor: string;   // ex: "#FFD700"
  scenes: Scene[];
}
