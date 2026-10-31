import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

// Outline/sombra pretos em volta do texto — garante legibilidade sobre qualquer fundo
// (gradiente ou imagem do Ken Burns). É herdado pelos spans filhos (text-shadow é inherited).
export const TEXT_OUTLINE =
  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)";

// Sombra leve (sem outline rígido) — só para cenas sem foto de fundo (gradiente limpo),
// onde o contraste já é alto o bastante sem precisar do contorno de 4 direções.
export const SOFT_TEXT_SHADOW = "0 8px 24px rgba(0,0,0,0.45)";

// Serifada editorial (estilo motionmaxxing) para headlines/CTAs em cenas sem foto —
// números/dados continuam na sans bold existente.
export const { fontFamily: SERIF_FONT } = loadFont("normal", { weights: ["600", "700", "900"] });

// **texto** → branco bold   *texto* → accentColor bold
export function parseText(raw: string, accent: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) parts.push(raw.slice(last, m.index));
    if (m[1]) parts.push(<span key={m.index} style={{ color: "#fff", fontWeight: 900 }}>{m[1]}</span>);
    else       parts.push(<span key={m.index} style={{ color: accent, fontWeight: 900 }}>{m[2]}</span>);
    last = re.lastIndex;
  }
  if (last < raw.length) parts.push(raw.slice(last));
  return parts;
}

export type ColoredWord = { text: string; color: "accent" | "white" | "normal" };

// Quebra o texto em palavras preservando o destaque (*amarelo*, **branco**) mesmo
// quando ele cobre várias palavras (ex: "*juros compostos*") — usado para animar
// palavra por palavra sem expor os asteriscos literalmente.
export function splitHighlightWords(raw: string): ColoredWord[] {
  const out: ColoredWord[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const pushPlain = (chunk: string, color: ColoredWord["color"]) => {
    chunk.split(" ").filter(Boolean).forEach((w) => out.push({ text: w, color }));
  };
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) pushPlain(raw.slice(last, m.index), "normal");
    if (m[1] !== undefined) pushPlain(m[1], "white");
    else pushPlain(m[2]!, "accent");
    last = re.lastIndex;
  }
  if (last < raw.length) pushPlain(raw.slice(last), "normal");
  return out;
}

export function colorForWord(color: ColoredWord["color"], accent: string, normal = "rgba(255,255,255,0.92)"): string {
  if (color === "accent") return accent;
  if (color === "white") return "#fff";
  return normal;
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ΣΔΦΩ#%&@";
const SCRAMBLE_RESOLVE_FRACTION = 0.45; // fração da duração que cada caractere leva pra travar, após seu atraso em cascata

// Determinístico (não Math.random) — o Remotion pode re-renderizar o mesmo frame
// várias vezes (preview, seek), e um valor aleatório de verdade causaria flicker.
function pseudoRandomChar(seed: number): string {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return SCRAMBLE_CHARS[Math.floor(frac * SCRAMBLE_CHARS.length)];
}

// Efeito "scramble/decode": cada caractere começa aleatório (tipo glitch) e trava no
// caractere final em cascata da esquerda pra direita, convergindo totalmente em
// `durationInFrames` quadros a partir de `startFrame`.
export function useScrambleText(text: string, startFrame: number, durationInFrames = 20): string {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  const n = text.length;
  const resolveWindow = durationInFrames * SCRAMBLE_RESOLVE_FRACTION;
  const staggerSpan = durationInFrames - resolveWindow;

  return text
    .split("")
    .map((c, i) => {
      if (c === " ") return " ";
      const charDelay = n > 1 ? (i / (n - 1)) * staggerSpan : 0;
      if (elapsed >= charDelay + resolveWindow) return c;
      return pseudoRandomChar(frame * 17 + i * 31);
    })
    .join("");
}

export const ScrambleText: React.FC<{ text: string; startFrame: number; durationInFrames?: number }> = ({
  text,
  startFrame,
  durationInFrames,
}) => <>{useScrambleText(text, startFrame, durationInFrames)}</>;

// Entrada calma (opacidade + desfoque, sem glitch) — para headlines nas cenas sem foto
// de fundo (estilo motionmaxxing: "the question can't wait" aparece nítido aos poucos).
export const BlurReveal: React.FC<{ text: string; startFrame: number; durationInFrames?: number }> = ({
  text,
  startFrame,
  durationInFrames = 18,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{ display: "inline-block", opacity: p, filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)` }}>
      {text}
    </span>
  );
};
