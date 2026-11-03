import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxImpact, sfxSuccess } from "../utils/soundSynth";

const LEVEL_H = 56;
const BASE_W = 440;
const START_FRAME = 8;
const STAGGER = 14;

// Pirâmide de níveis empilhados da base ao topo, revelados um a um — use pra ilustrar
// hierarquia ou prioridade (base = fundação, topo = objetivo), diferente de
// "supplychain" (fluxo sequencial horizontal, não camadas verticais).
export const PyramidHierarchyScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const levels = scene.pyramidLevels ?? [];
  const n = levels.length;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastStart = START_FRAME + (n - 1) * STAGGER;
  const noteStart = lastStart + 20;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const totalH = n * LEVEL_H;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.pyramidLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pyramidLabel}
        </div>
      )}

      <svg width={BASE_W + 40} height={totalH + 20} viewBox={`0 0 ${BASE_W + 40} ${totalH + 20}`}>
        {levels.map((level, idxFromBase) => {
          // idxFromBase: 0 = base (widest). Render order base->top, but reveal base first too.
          const startFrame = START_FRAME + idxFromBase * STAGGER;
          const revealP = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const widthTop = BASE_W * (1 - (idxFromBase + 1) / n);
          const widthBottom = BASE_W * (1 - idxFromBase / n);
          const y = totalH - (idxFromBase + 1) * LEVEL_H;
          const xTop = (BASE_W - widthTop) / 2 + 20;
          const xBottom = (BASE_W - widthBottom) / 2 + 20;
          const isTop = idxFromBase === n - 1;
          const fill = isTop ? accent : `rgba(255,255,255,${0.25 + idxFromBase * 0.08})`;
          const slideY = interpolate(revealP, [0, 1], [20, 0]);
          return (
            <g key={idxFromBase} style={{ opacity: revealP }} transform={`translate(0, ${slideY})`}>
              <Sequence from={startFrame} durationInFrames={13} layout="none">
                <Audio src={sfxImpact(0.2)} volume={0.18} />
              </Sequence>
              {isTop && (
                <Sequence from={startFrame + 12} durationInFrames={11} layout="none">
                  <Audio src={sfxSuccess()} volume={0.2} />
                </Sequence>
              )}
              <polygon
                points={`${xTop},${y} ${xTop + widthTop},${y} ${xBottom + widthBottom},${y + LEVEL_H} ${xBottom},${y + LEVEL_H}`}
                fill={fill}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={1}
                style={isTop ? { filter: `drop-shadow(0 0 10px ${accent}90)` } : undefined}
              />
              <text x={(BASE_W + 40) / 2} y={y + LEVEL_H / 2 + 6} textAnchor="middle" fontSize={18}
                    fontWeight={700} fill={isTop ? "#1a1a1a" : "var(--ink)"} fontFamily={SERIF_FONT}>
                {level.label}
              </text>
            </g>
          );
        })}
      </svg>

      {scene.pyramidNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pyramidNote}
        </div>
      )}
    </div>
  );
};
