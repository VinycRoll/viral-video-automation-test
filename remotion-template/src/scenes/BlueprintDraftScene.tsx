import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
// contorno genérico (casa/ícone) — comprimento aproximado do traçado
const PATH = `M${CX - 70},${CY + 70} L${CX - 70},${CY - 10} L${CX},${CY - 80} L${CX + 70},${CY - 10} L${CX + 70},${CY + 70} Z M${CX - 20},${CY + 70} L${CX - 20},${CY + 20} L${CX + 20},${CY + 20} L${CX + 20},${CY + 70}`;
const PATH_LENGTH = 560;
const DRAW_END = 70;

// Fundo quadriculado azul técnico com o contorno de um objeto desenhado em linhas
// brancas animadas (stroke-dashoffset) e cotas de medida. Use pra explicar a
// ANATOMIA ou especificação técnica de algo (design, engenharia, arquitetura).
export const BlueprintDraftScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dashOffset = interpolate(frame, [0, DRAW_END], [PATH_LENGTH, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dimsOp = interpolate(frame, [DRAW_END, DRAW_END + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [DRAW_END + 30, DRAW_END + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.blueprintLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.blueprintLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="#0a3d62" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(i * SIZE) / 11} x2={SIZE} y2={(i * SIZE) / 11}
                stroke="var(--ink-08)" strokeWidth={1} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={(i * SIZE) / 11} y1={0} x2={(i * SIZE) / 11} y2={SIZE}
                stroke="var(--ink-08)" strokeWidth={1} />
        ))}

        <path d={PATH} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"
              strokeDasharray={PATH_LENGTH} strokeDashoffset={dashOffset} />

        <g opacity={dimsOp}>
          <line x1={CX - 70} y1={CY + 90} x2={CX + 70} y2={CY + 90} stroke={accent} strokeWidth={1.5} />
          <line x1={CX - 70} y1={CY + 82} x2={CX - 70} y2={CY + 98} stroke={accent} strokeWidth={1.5} />
          <line x1={CX + 70} y1={CY + 82} x2={CX + 70} y2={CY + 98} stroke={accent} strokeWidth={1.5} />
          <text x={CX} y={CY + 108} fill={accent} fontSize={14} fontWeight={700} textAnchor="middle">140cm</text>

          <line x1={CX + 92} y1={CY - 80} x2={CX + 92} y2={CY + 70} stroke={accent} strokeWidth={1.5} />
          <text x={CX + 100} y={CY} fill={accent} fontSize={14} fontWeight={700}>150cm</text>
        </g>

        {scene.blueprintTitle && (
          <text x={CX} y={SIZE - 14} fill="var(--ink)" fontSize={16} fontWeight={700} textAnchor="middle" opacity={dimsOp} letterSpacing={1}>
            {scene.blueprintTitle.toUpperCase()}
          </text>
        )}
      </svg>

      {scene.blueprintNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.blueprintNote}
        </div>
      )}

      <Sequence from={0} durationInFrames={DRAW_END} layout="none">
        <Audio src={sfxWhoosh(DRAW_END / 30)} volume={0.11} />
      </Sequence>
    </div>
  );
};
