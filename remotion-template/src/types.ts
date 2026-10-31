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
}

export interface VideoScript {
  title: string;
  accentColor: string;   // ex: "#FFD700"
  scenes: Scene[];
}
