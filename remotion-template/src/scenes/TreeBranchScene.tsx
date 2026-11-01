import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const VB = 400;
const CENTER_X = 200;
const BASE_Y = 360;
const TRUNK_LEN = 170;
const TRUNK_TOP_Y = BASE_Y - TRUNK_LEN;
const BRANCH_LEN = 140;

// Tronco que cresce de baixo pra cima e se ramifica em 2-4 direções, cada uma com um
// rótulo — use pra mostrar uma causa se desdobrando em várias consequências ou
// categorias, diferente de "domino" (uma cadeia linear, não uma ramificação).
export const TreeBranchScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const branches = scene.treeBranches ?? [];
  const n = Math.max(1, branches.length);

  const trunkOffset = interpolate(frame, [0, 20], [TRUNK_LEN, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rootOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastBranchEnd = 35 + (n - 1) * 8;
  const noteOp = interpolate(frame, [lastBranchEnd + 16, lastBranchEnd + 28], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 20, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.treeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.treeLabel}
        </div>
      )}

      <svg width={VB} height={VB} viewBox={`0 0 ${VB} ${VB}`}>
        <line x1={CENTER_X} y1={BASE_Y} x2={CENTER_X} y2={TRUNK_TOP_Y}
              stroke="rgba(255,255,255,0.6)" strokeWidth={6} strokeLinecap="round"
              strokeDasharray={TRUNK_LEN} strokeDashoffset={trunkOffset} />

        {branches.map((b, i) => {
          const angleDeg = n === 1 ? 0 : -55 + (110 / (n - 1)) * i;
          const angleRad = (angleDeg * Math.PI) / 180;
          const dx = Math.sin(angleRad) * BRANCH_LEN;
          const dy = -Math.cos(angleRad) * BRANCH_LEN;
          const endX = CENTER_X + dx;
          const endY = TRUNK_TOP_Y + dy;
          const start = 15 + i * 8;
          const off = interpolate(frame, [start, start + 20], [BRANCH_LEN, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const dotOp = interpolate(frame, [start + 16, start + 24], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <g key={i}>
              <line x1={CENTER_X} y1={TRUNK_TOP_Y} x2={endX} y2={endY}
                    stroke={accent} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={BRANCH_LEN} strokeDashoffset={off} />
              <circle cx={endX} cy={endY} r={7} fill={accent} opacity={dotOp} />
              <text x={endX + (dx / BRANCH_LEN) * 26} y={endY + (dy / BRANCH_LEN) * 26}
                    fill="#fff" fontSize={16} fontWeight={800} textAnchor="middle" opacity={dotOp}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>

      {scene.treeRootLabel && (
        <div style={{ opacity: rootOp, fontSize: 24, fontWeight: 800, color: "#fff",
                      textTransform: "uppercase", letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW, marginTop: -16 }}>
          {scene.treeRootLabel}
        </div>
      )}

      {scene.treeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.treeNote}
        </div>
      )}
    </div>
  );
};
