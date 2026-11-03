import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 300;
const PIVOT_X = SIZE / 2;
const PIVOT_Y = SIZE - 40;
const ROD_LEN = 190;
const MAX_ANGLE = 34;

// Haste invertida tipo pêndulo de metrônomo oscilando da esquerda pra direita em
// ritmo que acelera gradualmente, com indicadores de batida nas extremidades. Use
// pra RITMO, consistência ou hábito regular.
export const MetronomeSwingScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const freqFactor = Math.min(0.045 + frame * 0.00004, 0.22);
  const angle = Math.sin(frame * freqFactor) * MAX_ANGLE;

  const rad = (angle * Math.PI) / 180;
  const tipX = PIVOT_X + Math.sin(rad) * ROD_LEN;
  const tipY = PIVOT_Y - Math.cos(rad) * ROD_LEN;

  const leftAngle = -MAX_ANGLE;
  const rightAngle = MAX_ANGLE;
  const leftGlow = interpolate(angle, [leftAngle, leftAngle + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightGlow = interpolate(angle, [rightAngle - 10, rightAngle], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const leftTipX = PIVOT_X + Math.sin((leftAngle * Math.PI) / 180) * ROD_LEN;
  const leftTipY = PIVOT_Y - Math.cos((leftAngle * Math.PI) / 180) * ROD_LEN;
  const rightTipX = PIVOT_X + Math.sin((rightAngle * Math.PI) / 180) * ROD_LEN;
  const rightTipY = PIVOT_Y - Math.cos((rightAngle * Math.PI) / 180) * ROD_LEN;

  const noteOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {[20, 55, 90, 125].map((t) => (
        <Sequence key={t} from={t} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      {scene.metronomeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.metronomeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <polygon points={`${PIVOT_X - 60},${SIZE} ${PIVOT_X + 60},${SIZE} ${PIVOT_X},${SIZE - 60}`}
                 fill="none" stroke="var(--ink-3)" strokeWidth={3} />

        <circle cx={leftTipX} cy={leftTipY} r={9} fill={accent} opacity={0.3 + leftGlow * 0.7}
                style={{ filter: leftGlow > 0.5 ? `drop-shadow(0 0 12px ${accent})` : "none" }} />
        <circle cx={rightTipX} cy={rightTipY} r={9} fill={accent} opacity={0.3 + rightGlow * 0.7}
                style={{ filter: rightGlow > 0.5 ? `drop-shadow(0 0 12px ${accent})` : "none" }} />

        <line x1={PIVOT_X} y1={PIVOT_Y} x2={tipX} y2={tipY} stroke="var(--ink)" strokeWidth={4} strokeLinecap="round" />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={8} fill="var(--ink)" />
        <circle cx={tipX} cy={tipY} r={10} fill={accent} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
      </svg>

      {scene.metronomeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.metronomeNote}
        </div>
      )}
    </div>
  );
};
