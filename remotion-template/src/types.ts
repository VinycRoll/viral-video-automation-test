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
}

export interface VideoScript {
  title: string;
  accentColor: string;   // ex: "#FFD700"
  scenes: Scene[];
}
