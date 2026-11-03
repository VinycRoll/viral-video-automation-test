import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact, sfxExplosion } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const IMPACT_FRAME = 40;
const FRAGMENTS = 6;

const CRACKS = [
  "M160,160 L120,90 L95,60",
  "M160,160 L230,100 L260,70",
  "M160,160 L100,210 L60,250",
  "M160,160 L220,220 L255,260",
  "M160,160 L190,80",
  "M160,160 L130,240",
];

// Painel sofre impacto (flash + shake), racha a partir do centro e se divide em
// fragmentos triangulares que se afastam revelando o fundo. Use pra QUEBRA de
// expectativa, mito desfeito ou colapso de algo frágil.
export const ShatterGlassScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeT = frame - IMPACT_FRAME;
  const shake = shakeT >= 0 && shakeT < 10 ? Math.sin(shakeT * 3) * 6 * (1 - shakeT / 10) : 0;
  const flashOp = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 3, IMPACT_FRAME + 12], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const crackP = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fragP = interpolate(frame, [IMPACT_FRAME + 8, IMPACT_FRAME + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panelOp = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fragOp = interpolate(fragP, [0, 0.6, 1], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [IMPACT_FRAME + 50, IMPACT_FRAME + 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={IMPACT_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      <Sequence from={IMPACT_FRAME + 8} durationInFrames={20} layout="none">
        <Audio src={sfxExplosion()} volume={0.2} />
      </Sequence>
      {scene.shatterLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.shatterLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {panelOp > 0 && (
          <g transform={`translate(${shake}, 0)`} opacity={panelOp}>
            <rect x={60} y={100} width={200} height={120} rx={12} fill="var(--ink-08)"
                  stroke={accent} strokeWidth={3} />
            {scene.shatterTitle && (
              <text x={CX} y={CY + 6} fill="var(--ink)" fontSize={22} fontWeight={800} textAnchor="middle">
                {scene.shatterTitle}
              </text>
            )}
          </g>
        )}

        {crackP > 0 && panelOp > 0 && CRACKS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--ink)" strokeWidth={2} pathLength={1}
                strokeDasharray={1} strokeDashoffset={1 - crackP} opacity={0.85} />
        ))}

        {fragP > 0 && Array.from({ length: FRAGMENTS }).map((_, i) => {
          const angle = (360 / FRAGMENTS) * i;
          const rad = (angle * Math.PI) / 180;
          const dist = fragP * 150;
          const dx = Math.cos(rad) * dist;
          const dy = Math.sin(rad) * dist;
          const rot = fragP * (60 + i * 20) * (i % 2 === 0 ? 1 : -1);
          const r = 70;
          const p1 = `${CX},${CY}`;
          const p2 = `${CX + Math.cos(rad) * r},${CY + Math.sin(rad) * r}`;
          const p3 = `${CX + Math.cos(rad + 0.9) * r},${CY + Math.sin(rad + 0.9) * r}`;
          return (
            <polygon key={i} points={`${p1} ${p2} ${p3}`} fill={accent} opacity={fragOp * 0.5}
                      stroke="var(--ink)" strokeWidth={1}
                      transform={`translate(${dx}, ${dy}) rotate(${rot}, ${CX}, ${CY})`} />
          );
        })}

        <rect x={0} y={0} width={SIZE} height={SIZE} fill="var(--ink)" opacity={flashOp * 0.6} />
      </svg>

      {scene.shatterNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.shatterNote}
        </div>
      )}
    </div>
  );
};
