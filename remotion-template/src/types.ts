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
  | "brain"
  | "ecg"
  | "illusion"
  | "soundwave"
  | "depthdive"
  | "pressure"
  | "chainreaction"
  | "pendulum"
  | "slotmachine"
  | "labmix"
  | "pyramid"
  | "supplychain"
  | "crowd"
  | "balancebeam"
  | "glitch"
  | "radar"
  | "evolution"
  | "microscope"
  | "telescope"
  | "blueprint"
  | "vortex"
  | "chess"
  | "morse"
  | "hourglass"
  | "satellite"
  | "barcode"
  | "stamp"
  | "metronome"
  | "compass"
  | "liquidfill"
  | "radiotuner"
  | "spotlight"
  | "shredder"
  | "magnetic"
  | "circuit"
  | "shatter"
  | "curtain"
  | "bombfuse"
  | "kaleidoscope"
  | "abacus"
  | "lever"
  | "cardhouse"
  | "centrifuge"
  | "chromatography"
  | "cointoss"
  | "conveyor"
  | "cubeunfold"
  | "cuckoo"
  | "decibel"
  | "safedial"
  | "droplet"
  | "elevator"
  | "filmstrip"
  | "hydraulicpress"
  | "lasermaze"
  | "origami"
  | "parachute"
  | "periscope"
  | "pinball"
  | "rubiks"
  | "sieve"
  | "stethoscope"
  | "tuningfork"
  | "windvane"
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

  // brain — silhueta de cérebro com pulsos elétricos viajando entre regiões, uma delas
  // acendendo. Use pra curiosidades sobre memória, medo, sono, QI ou ilusões cognitivas.
  brainLabel?: string;
  brainRegionLabel?: string; // nome da região que acende, ex: "AMÍGDALA"
  brainNote?: string;

  // ecg — monitor cardíaco batendo em ritmo normal que acelera (vermelho) ou fica reto
  // (flatline). Use pra tensão, adrenalina, sobrevivência ou medicina.
  ecgLabel?: string;
  ecgMode?: "spike" | "flatline"; // padrão "spike"
  ecgNote?: string;

  // illusion — duas formas idênticas cercadas por referências que enganam o olho, até se
  // aproximarem revelando que são iguais. Use pra ilusões de ótica/percepção.
  illusionLabel?: string;
  illusionNote?: string; // ex: "OS DOIS CÍRCULOS SÃO IDÊNTICOS"

  // soundwave — equalizador de barras oscilando que de repente explode em amplitude ou
  // vira agudo/rápido. Use pra fatos sobre música, voz, ecolocalização, ruído.
  soundLabel?: string;
  soundMode?: "loud" | "highpitch"; // padrão "loud"
  soundNote?: string;

  // depthdive — mergulho vertical contínuo que escurece o gradiente e revela marcadores
  // de profundidade em sequência. Use pra oceano, camadas da Terra ou altitude.
  depthLabel?: string;
  depthMarks?: { label: string }[]; // 3-4 marcadores em ordem, ex: [{label:"-200m"}, ...]
  depthNote?: string;

  // pressure — duas placas esmagando um objeto central até comprimir/rachar. Use pra
  // gravidade de outros planetas, pressão atmosférica ou força de mordida.
  pressureLabel?: string;
  pressureTitle?: string; // o que está sendo esmagado, ex: "A 11KM DE PROFUNDIDADE"
  pressureNote?: string;

  // chainreaction — 1 bolinha colide gerando 2, 4, 8, 16, 32..., tomando a tela. Use pra
  // crescimento exponencial, vírus, fofoca ou reação nuclear.
  chainLabel?: string;
  chainRounds?: number; // padrão 5, dobra a cada rodada
  chainNote?: string;

  // pendulum — 2-3 pêndulos balançando em velocidades diferentes até sincronizarem. Use
  // pra física, hipnose, ritmo ou passagem do tempo.
  pendulumLabel?: string;
  pendulumNote?: string;

  // slotmachine — 3 rolos de caça-níquel girando que travam um por um revelando um
  // valor. Use pra coincidências bizarras, loteria ou probabilidade da vida existir.
  slotLabel?: string;
  slotValue?: string; // valor final revelado, ex: "1 EM 1.000.000"
  slotNote?: string;

  // labmix — dois tubos de ensaio despejam líquidos num béquer central que muda de cor e
  // borbulha. Use pra química, culinária, venenos ou invenções acidentais.
  labLabel?: string;
  labLeftLabel?: string;
  labRightLabel?: string;
  labResultLabel?: string; // texto no béquer final
  labNote?: string;

  // pyramid — pirâmide fatiada em camadas que se constroem da base ao topo iluminado.
  // Use pra classes sociais históricas, cadeia alimentar ou níveis de raridade.
  pyramidLabel?: string;
  pyramidLevels?: { label: string }[]; // 3-5, ordem da base ao topo
  pyramidNote?: string;

  // supplychain — 3 estações numa esteira acendendo em sequência, cada uma uma etapa de
  // transformação. Use pra "como isso é feito" ou a jornada de um objeto comum.
  supplyLabel?: string;
  supplySteps?: { label: string }[]; // 3 etapas em ordem
  supplyNote?: string;

  // crowd — grade de silhuetas de pessoas surgindo (ou desaparecendo) rapidamente até
  // preencher a tela. Use pra impérios antigos, extinções, migrações, demografia.
  crowdLabel?: string;
  crowdCount?: number; // padrão 60
  crowdGrowing?: boolean; // padrão true (surgindo); false = desaparecendo
  crowdNote?: string;

  // balancebeam — gangorra longa com vários pesos pequenos de um lado tentando equilibrar
  // um bloco único do outro. Use pra comparações de extremos (ex: formigas vs. humanos).
  beamLabel?: string;
  beamManyLabel?: string;
  beamManyValue?: string;
  beamOneLabel?: string;
  beamOneValue?: string;
  beamNote?: string;

  // glitch — texto normal sofre interferência digital (RGB split, ruído) antes de revelar
  // uma mensagem oculta. Use pra crimes cibernéticos, bugs históricos, mistérios da internet.
  glitchLabel?: string; // texto inicial, visível antes do glitch
  glitchReveal?: string; // texto revelado após o glitch
  glitchNote?: string;

  // radar — tela de radar circular com linha de varredura girando que detecta pontos
  // piscando. Use pra aviação, submarinos, objetos perdidos ou astronomia.
  radarLabel?: string;
  radarBlips?: { label: string }[]; // 1-3 pontos detectados
  radarNote?: string;

  // evolution — linha horizontal com 4 estágios acendendo em sequência mostrando uma
  // evolução passo a passo. Use pra evolução tecnológica, biológica ou histórica.
  evoLabel?: string;
  evoStages?: { label: string }[]; // 4 estágios em ordem
  evoNote?: string;

  // microscope — zoom óptico em múltiplos níveis (10x -> 100x -> 1000x) dentro de uma
  // lente circular com grade e ajuste de foco. Use pra revelar um detalhe microscópico
  // escondido num fato (células, microorganismos, partículas).
  microscopeLabel?: string;
  microscopeLevels?: { label: string }[]; // 3 níveis em ordem, ex: ["10x","100x","1000x"]
  microscopeNote?: string;

  // telescope — luneta vasculhando um céu estrelado até travar num astro distante,
  // revelando anéis/brilho com linhas de medição. Use pra astronomia, distâncias
  // cósmicas ou descobertas espaciais.
  telescopeLabel?: string;
  telescopeTargetLabel?: string; // nome do astro/objeto encontrado
  telescopeNote?: string;

  // blueprint — fundo quadriculado azul técnico com o contorno de um objeto desenhado
  // em linhas brancas animadas e cotas de medida. Use pra explicar a ANATOMIA ou
  // especificação técnica de algo (design, engenharia, arquitetura).
  blueprintLabel?: string;
  blueprintTitle?: string; // nome do objeto desenhado
  blueprintNote?: string;

  // vortex — espiral central com efeito gravitacional puxando itens das bordas da tela
  // em direção ao núcleo até desaparecerem. Use pra descrever algo que "suga"
  // recursos/atenção/tempo (dívida, vício, buraco negro, distração).
  vortexLabel?: string;
  vortexItems?: { label: string }[]; // itens/palavras sugados pro centro
  vortexNote?: string;

  // chess — tabuleiro minimalista onde uma peça avança e derruba outra com impacto. Use
  // pra ESTRATÉGIA, planejamento ou decisões calculadas (vencer um adversário, prever
  // um movimento).
  chessLabel?: string;
  chessMoveLabel?: string; // descreve a jogada/estratégia
  chessNote?: string;

  // morse — ponto luminoso piscando ritmadamente enquanto pontos/traços são traduzidos
  // pra letras abaixo. Use pra CÓDIGOS, comunicação secreta ou SOS/emergência.
  morseLabel?: string;
  morseCode?: string;  // ex: "... --- ..."
  morseWord?: string;  // palavra traduzida, tem que bater com a narração
  morseNote?: string;

  // hourglass — ampulheta minimalista com grãos caindo continuamente que, ao zerar, gira
  // 180°. Use pra TEMPO SE ESGOTANDO, prazos ou urgência.
  hourglassLabel?: string;
  hourglassNote?: string;

  // satellite — silhueta de satélite disparando feixe cônico que varre uma superfície e
  // destaca pontos ocultos em verde. Use pra VIGILÂNCIA, descoberta ou monitoramento à
  // distância.
  satelliteLabel?: string;
  satelliteTargetLabel?: string; // o que foi encontrado na varredura
  satelliteNote?: string;

  // barcode — linhas verticais de código de barras atravessadas por um laser vermelho
  // horizontal revelando um valor. Use pra PREÇO, identificação ou escaneamento de dados.
  barcodeLabel?: string;
  barcodeValue?: string; // valor revelado pelo scanner
  barcodeNote?: string;

  // stamp — documento que recebe o impacto de um carimbo (com tremor de câmera e
  // partículas de tinta) deixando uma marca angulada. Use pra APROVAÇÃO, veto ou
  // decisão oficial/burocrática.
  stampLabel?: string;
  stampWord?: string; // ex: "APROVADO", "BANIDO", "SECRETO"
  stampNote?: string;

  // metronome — haste invertida oscilando em ritmo constante que acelera gradualmente
  // com indicadores de batida. Use pra RITMO, consistência ou hábito regular.
  metronomeLabel?: string;
  metronomeNote?: string;

  // compass — rosa dos ventos completa onde a agulha gira desorientada várias vezes
  // antes de travar numa direção específica. Use pra ORIENTAÇÃO, propósito ou decisão
  // de rumo/direção.
  compassLabel?: string;
  compassDirection?: string; // direção final, ex: "NORTE"
  compassNote?: string;

  // liquidfill — recipiente transparente sendo preenchido de baixo pra cima com ondas
  // suaves até 100%. Use pra ACÚMULO gradual de algo líquido/fluido (reserva, cota,
  // capacidade).
  liquidLabel?: string;
  liquidPct?: number; // 0-100, valor final
  liquidNote?: string;

  // radiotuner — mostrador horizontal de frequências onde um ponteiro vermelho desliza
  // com ruído até sintonizar um ponto exato e limpo. Use pra ENCONTRAR o ponto certo
  // (sintonia, precisão, acerto depois de tentativa e erro).
  radioLabel?: string;
  radioFreq?: string; // frequência sintonizada, ex: "97.5 MHz"
  radioNote?: string;

  // spotlight — tela escura com dois holofotes cônicos procurando até se cruzarem no
  // centro, iluminando o elemento principal. Use pra DESTAQUE ou revelação dramática de
  // algo em evidência.
  spotlightLabel?: string;
  spotlightTitle?: string; // o que é revelado no centro do holofote
  spotlightNote?: string;

  // shredder — folha que desce por uma fenda horizontal e sai fatiada em tiras verticais.
  // Use pra DESTRUIÇÃO de informação, descarte ou eliminação de algo (documentos,
  // provas, dívidas pagas).
  shredderLabel?: string;
  shredderTitle?: string; // o que está sendo destruído/eliminado
  shredderNote?: string;

  // magnetic — dois blocos que se repelem elasticamente até um girar 180° e colarem
  // instantaneamente. Use pra REPULSÃO que se torna ATRAÇÃO, ou opostos que se atraem.
  magneticLabel?: string;
  magneticLeftLabel?: string;
  magneticRightLabel?: string;
  magneticNote?: string;

  // circuit — trilhas com curvas de 45° onde pulsos de luz viajam de chips periféricos
  // até acender um processador central. Use pra TECNOLOGIA, processamento ou sistemas
  // conectados.
  circuitLabel?: string;
  circuitCenterLabel?: string; // texto no processador central
  circuitNote?: string;

  // shatter — painel/ícone que sofre impacto, racha a partir do centro e se divide em
  // fragmentos. Use pra QUEBRA de expectativa, mito desfeito ou colapso de algo frágil.
  shatterLabel?: string;
  shatterTitle?: string; // o que se quebra
  shatterNote?: string;

  // curtain — duas metades de tecido que se abrem do centro pras laterais com física de
  // balanço, revelando o conteúdo. Use pra REVELAÇÃO teatral de algo importante.
  curtainLabel?: string;
  curtainTitle?: string; // o que é revelado atrás da cortina
  curtainNote?: string;

  // bombfuse — pavio curvo com faísca percorrendo o caminho até o ícone final gerar uma
  // expansão de círculos concêntricos. Use pra CONTAGEM REGRESSIVA, tensão crescente ou
  // ato que vai "explodir" (uma decisão, uma crise, um prazo).
  fuseLabel?: string;
  fuseTitle?: string; // o que explode/é revelado no fim do pavio
  fuseNote?: string;

  // kaleidoscope — formas geométricas simétricas girando e se multiplicando a partir do
  // centro em espelhamento radial. Use pra PADRÕES, fractais ou multiplicação visual
  // hipnótica (sem ligação direta a um fato específico — mais transição/respiro visual).
  kaleidoscopeLabel?: string;
  kaleidoscopeNote?: string;

  // abacus — contas deslizando em hastes horizontais somando unidades/dezenas/centenas.
  // Use pra CÁLCULO, soma visual ou matemática antiga vs. moderna.
  abacusLabel?: string;
  abacusValue?: string; // número final somado
  abacusNote?: string;

  // lever — alavanca longa sobre um pequeno fulcro, onde pouca força na ponta longa
  // levanta um bloco gigante na ponta curta. Use pra EFICIÊNCIA, pequeno esforço gerando
  // grande resultado (juro composto, alavancagem financeira).
  leverLabel?: string;
  leverNote?: string;

  // cardhouse — estrutura triangular de cartas que sobe andar por andar e desmonta com
  // um sopro lateral. Use pra algo CONSTRUÍDO SOBRE BASE FRÁGIL (esquema, bolha, castelo
  // de cartas financeiro).
  cardhouseLabel?: string;
  cardhouseFloors?: number; // nº de andares construídos antes de cair (padrão 4)
  cardhouseNote?: string;

  // centrifuge — tambor circular girando em alta velocidade, separando elementos pesados
  // pras bordas e deixando os leves no centro. Use pra SEPARAÇÃO/FILTRAGEM do que importa
  // vs. o que não importa.
  centrifugeLabel?: string;
  centrifugeNote?: string;

  // chromatography — gota de tinta preta no centro que se expande radialmente em anéis
  // de cores diferentes. Use pra DECOMPOSIÇÃO de algo complexo em partes, ou química/
  // ciência forense.
  chromatographyLabel?: string;
  chromatographyNote?: string;

  // cointoss — moeda lançada que gira no ar e cai revelando cara ou coroa. Use pra SORTE,
  // ACASO ou uma decisão de 50/50.
  coinLabel?: string;
  coinResult?: "cara" | "coroa"; // resultado final, padrão "cara"
  coinNote?: string;

  // conveyor — esteira horizontal trazendo itens em fila onde um braço mecânico separa
  // defeituosos (vermelho) dos aprovados (verde). Use pra SELEÇÃO, triagem ou controle
  // de qualidade.
  conveyorLabel?: string;
  conveyorNote?: string;

  // cubeunfold — cubo isométrico que se abre desmontando as 6 faces numa cruz plana,
  // revelando um ícone em cada face. Use pra MÚLTIPLAS FACETAS de um mesmo assunto (ex:
  // "6 formas de economizar").
  cubeLabel?: string;
  cubeFaces?: { label: string }[]; // até 6 faces, cada uma um ícone/palavra
  cubeNote?: string;

  // cuckoo — relógio estilizado que bate na hora exata e dispara uma porta de onde salta
  // um ícone em mola. Use pra EVENTO PONTUAL que se repete (rotina, data marcada,
  // compromisso recorrente).
  cuckooLabel?: string;
  cuckooTime?: string; // hora em que bate, ex: "12:00"
  cuckooRevealLabel?: string; // o que salta da porta
  cuckooNote?: string;

  // decibel — barra vertical segmentada (verde/amarelo/vermelho) acendendo de baixo pra
  // cima com pico marcado no topo. Use pra INTENSIDADE crescente de som, risco ou
  // impacto.
  decibelLabel?: string;
  decibelPct?: number; // 0-100, intensidade final
  decibelNote?: string;

  // safedial — disco numerado de cofre girando esquerda/direita/esquerda até destravar
  // uma tranca pesada. Use pra SEGREDO, código de acesso ou algo que exige a combinação
  // certa.
  safeLabel?: string;
  safeCombo?: number[]; // sequência de números, ex: [42, 15, 88]
  safeNote?: string;

  // droplet — gota que cai do topo e, ao atingir o centro, gera ondas circulares que se
  // expandem perdendo opacidade. Use pra EFEITO CASCATA de uma ação pequena (uma decisão
  // que se propaga, uma notícia se espalhando).
  dropletLabel?: string;
  dropletNote?: string;

  // elevator — painel de andares com seta subindo enquanto linhas de fundo passam rápido
  // pra baixo, dando sensação de subida. Use pra PROGRESSÃO DE NÍVEL ou ascensão (carreira,
  // patrimônio subindo de faixa).
  elevatorLabel?: string;
  elevatorFloor?: string; // andar final, ex: "100"
  elevatorNote?: string;

  // filmstrip — rolo de película de 35mm que desliza frame a frame até parar num quadro
  // iluminado como projetor. Use pra MEMÓRIA, flashback ou um momento específico em
  // destaque dentro de uma sequência.
  filmstripLabel?: string;
  filmstripTitle?: string; // texto no quadro em destaque
  filmstripNote?: string;

  // hydraulicpress — pistão que desce lentamente esmagando um elemento elástico até ele
  // saltar ou se moldar numa nova forma. Use pra PRESSÃO/ESFORÇO que força uma
  // transformação ou adaptação.
  pressLabel?: string;
  pressTitle?: string; // o que está sendo pressionado/moldado
  pressNote?: string;

  // lasermaze — feixe de luz reto que reflete em 3-4 espelhos angulados até atingir um
  // alvo no lado oposto. Use pra CAMINHO INDIRETO até um objetivo (estratégia com
  // obstáculos, plano com várias etapas).
  laserLabel?: string;
  laserTargetLabel?: string; // o alvo final atingido
  laserNote?: string;

  // origami — folha quadrada plana cujas pontas se dobram sequencialmente até formar a
  // silhueta de um objeto. Use pra TRANSFORMAÇÃO progressiva de algo simples em algo
  // elaborado (passo a passo que constrói um resultado).
  origamiLabel?: string;
  origamiTitle?: string; // forma final dobrada
  origamiNote?: string;

  // parachute — objeto cai rápido e, no meio da tela, abre um paraquedas elástico que
  // desacelera instantaneamente numa descida suave. Use pra FREADA DE EMERGÊNCIA, um
  // amortecedor que evita o pior cenário (reserva de emergência, seguro).
  parachuteLabel?: string;
  parachuteTitle?: string; // o que é salvo pelo paraquedas
  parachuteNote?: string;

  // periscope — visor circular com mira graduada que emerge de baixo, gira procurando um
  // alvo e trava com zoom. Use pra OBSERVAÇÃO discreta ou buscar algo escondido da
  // superfície.
  periscopeLabel?: string;
  periscopeTargetLabel?: string; // o que é encontrado
  periscopeNote?: string;

  // pinball — bola cai entre três bumpers que piscam e crescem a cada colisão, somando
  // pontos rapidamente. Use pra ACÚMULO RÁPIDO E CAÓTICO de pontos/ganhos em sequência
  // (juros compostos acelerando, pontos de fidelidade).
  pinballLabel?: string;
  pinballScore?: string; // pontuação final, tem que bater com a narração
  pinballNote?: string;

  // rubiks — grade 3x3 de quadrados coloridos desalinhados onde linha/coluna deslizam até
  // encaixar todas as cores no centro. Use pra ORGANIZAÇÃO, resolver um problema complexo
  // ou colocar ordem no caos.
  rubiksLabel?: string;
  rubiksNote?: string;

  // sieve — malha horizontal que treme lateralmente: partículas grandes ficam retidas em
  // cima, pequenas atravessam e caem. Use pra FILTRAGEM, seleção do que é relevante vs.
  // descartável.
  sieveLabel?: string;
  sieveNote?: string;

  // stethoscope — campânula circular que pousa sobre um ponto, emitindo pulsos
  // sincronizados com batida dupla. Use pra DIAGNÓSTICO, saúde financeira/física ou
  // checagem de "sinais vitais" de algo.
  stethoscopeLabel?: string;
  stethoscopeNote?: string;

  // tuningfork — dois diapasões em "U" lado a lado; o da esquerda vibra e faz o da
  // direita vibrar por simpatia, sem contato. Use pra CONTÁGIO/INFLUÊNCIA invisível (um
  // hábito, uma emoção, uma ideia se propagando sem contato direto).
  tuningforkLabel?: string;
  tuningforkNote?: string;

  // windvane — linhas de vento varrendo a tela enquanto um cata-vento central gira e
  // aponta contra a corrente, com medição de velocidade. Use pra RESISTÊNCIA a uma força
  // externa ou se adaptar/posicionar contra uma tendência (mercado, maré).
  windvaneLabel?: string;
  windvaneSpeed?: string; // velocidade medida, ex: "42 km/h"
  windvaneNote?: string;
}

export interface VideoScript {
  title: string;
  accentColor: string;   // ex: "#FFD700"
  bgHueFrom?: number;    // faixa de hue (HSL) do gradiente de fundo — default 255
  bgHueTo?: number;      // default 275 (azul-roxo, paleta original)
  theme?: "dark" | "light"; // default "dark" — controla --ink/--card-fill e o fundo
  scenes: Scene[];
}
