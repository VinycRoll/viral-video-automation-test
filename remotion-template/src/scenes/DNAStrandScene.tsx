import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const H = 360;
const STEP = 18;
const AMP = 46;
const FREQ = 0.055;
const ROT_SPEED = 0.05;

// Hélice dupla estilizada em SVG girando suavemente, sem foto de fundo. Curinga pra
// qualquer curiosidade de biologia, saúde, genética ou evolução — puramente decorativo,
// sem dado numérico, diferente das outras cenas "sem foto" que sempre ilustram um valor.
export const DNAStrandScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rows = Math.floor(H / STEP);
  const phase = frame * ROT_SPEED;
  const points = Array.from({ length: rows }).map((_, i) => {
    const y = i * STEP;
    const xa = Math.sin(y * FREQ + phase) * AMP;
    const xb = Math.sin(y * FREQ + phase + Math.PI) * AMP;
    return { y, xa, xb };
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.dnaLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dnaLabel}
        </div>
      )}

      <svg width={AMP * 2 + 40} height={H} viewBox={`0 0 ${AMP * 2 + 40} ${H}`} style={{ opacity: bodyOp }}>
        <g transform={`translate(${AMP + 20}, 0)`}>
          {points.map((p, i) => (
            i % 2 === 0 ? (
              <line key={`r${i}`} x1={p.xa} y1={p.y} x2={p.xb} y2={p.y}
                    stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
            ) : null
          ))}
          <polyline points={points.map((p) => `${p.xa},${p.y}`).join(" ")}
                     fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round"
                     style={{ filter: `drop-shadow(0 0 8px ${accent}90)` }} />
          <polyline points={points.map((p) => `${p.xb},${p.y}`).join(" ")}
                     fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round"
                     style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" }} />
          {points.map((p, i) => (
            <React.Fragment key={`d${i}`}>
              <circle cx={p.xa} cy={p.y} r={5} fill={accent} />
              <circle cx={p.xb} cy={p.y} r={5} fill="#fff" />
            </React.Fragment>
          ))}
        </g>
      </svg>

      {scene.dnaNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dnaNote}
        </div>
      )}
    </div>
  );
};
