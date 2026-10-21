import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";

interface Props {
  scene: Scene;
  accentColor: string;
}

// Syntax highlight básico para Python/JS
function highlightCode(code: string, accentColor: string): React.ReactNode {
  const keywords = /\b(def|return|if|else|elif|for|while|import|from|class|True|False|None|and|or|not|in|is|lambda|print|let|const|var|function|=>\s*|async|await)\b/g;
  const strings = /(["'`])(?:(?!\1).)*\1/g;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const comments = /(#.*)$/gm;

  // Tokeniza linha por linha
  return code.split("\n").map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    // Simplificado: aplica cor a números e palavras-chave
    const tokenRegex = /\b(def|return|if|else|elif|for|while|import|from|class|True|False|None|and|or|not|in|is|print|let|const|var|function|async|await)\b|(["'])(?:(?!\2).)*\2|(\d+\.?\d*)|(#.*$)/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = tokenRegex.exec(line)) !== null) {
      if (m.index > lastIdx) {
        parts.push(<span key={key++}>{line.slice(lastIdx, m.index)}</span>);
      }
      if (m[1]) {
        // keyword
        parts.push(<span key={key++} style={{ color: "#C792EA" }}>{m[0]}</span>);
      } else if (m[2]) {
        // string
        parts.push(<span key={key++} style={{ color: "#C3E88D" }}>{m[0]}</span>);
      } else if (m[3]) {
        // número
        parts.push(<span key={key++} style={{ color: "#F78C6C" }}>{m[0]}</span>);
      } else if (m[4]) {
        // comentário
        parts.push(<span key={key++} style={{ color: "rgba(255,255,255,0.4)" }}>{m[0]}</span>);
      }
      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < line.length) {
      parts.push(<span key={key++}>{line.slice(lastIdx)}</span>);
    }

    return (
      <div key={lineIdx} style={{ lineHeight: 1.7 }}>
        {parts.length > 0 ? parts : " "}
      </div>
    );
  });
}

export const CodeScene: React.FC<Props> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, 12], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Cursor piscante
  const cursorOpacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 60px",
        boxSizing: "border-box",
      }}
    >
      {/* Header do bloco de código */}
      <div
        style={{
          width: "90%",
          background: "#1E1E2E",
          borderRadius: "16px 16px 0 0",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {["#FF5F57", "#FFBD2E", "#28CA41"].map((c, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, marginLeft: 8, fontFamily: "monospace" }}>
          {scene.language || "python"}
        </span>
      </div>

      {/* Bloco de código */}
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          width: "90%",
          background: "#1E1E2E",
          borderRadius: "0 0 16px 16px",
          padding: "28px 32px",
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: 32,
          color: "#CDD6F4",
          overflowX: "hidden",
        }}
      >
        {highlightCode(scene.code || "", accentColor)}
        {/* Cursor */}
        <span style={{ opacity: cursorOpacity, color: accentColor }}>▌</span>
      </div>
    </div>
  );
};
