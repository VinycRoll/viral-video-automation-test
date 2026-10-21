export type SceneType =
  | "intro"
  | "text"
  | "card"
  | "list"
  | "highlight"
  | "code"
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

  // intro / outro
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

  // code
  code?: string;
  language?: string;
}

export interface VideoScript {
  title: string;
  accentColor: string;   // ex: "#FFD700"
  scenes: Scene[];
}
