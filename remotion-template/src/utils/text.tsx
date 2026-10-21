import React from "react";

// Outline/sombra pretos em volta do texto — garante legibilidade sobre qualquer fundo
// (gradiente ou imagem do Ken Burns). É herdado pelos spans filhos (text-shadow é inherited).
export const TEXT_OUTLINE =
  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)";

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
