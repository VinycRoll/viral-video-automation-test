import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick } from "../utils/soundSynth";

const PERIODS = [48, 46, 44];
const ROD_LEN = 150;
const PIVOT_Y = 20;
const SWING_DEG = 32;
const SPACING = 170;

// Três pêndulos saem de fase e, num ponto calculado, voltam a balançar em sincronia —
// use pra ilustrar coisas que parecem desalinhadas no curto prazo mas convergem, diferente
// de "pyramidhierarchy" (hierarquia estática) ou "chainreaction" (crescimento, não ritmo).
export const PendulumWaveScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [165, 177], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const centerCrossFrames = PERIODS.flatMap((period) => {
    const frames: number[] = [];
    for (let k = 0; k * (period / 2) < 165; k++) frames.push(Math.round(k * (period / 2)));
    return frames;
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.pendulumLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pendulumLabel}
        </div>
      )}

      <svg width={SPACING * 2 + 60} height={ROD_LEN + PIVOT_Y + 40} viewBox={`0 0 ${SPACING * 2 + 60} ${ROD_LEN + PIVOT_Y + 40}`}>
        {PERIODS.map((period, i) => {
          const pivotX = 30 + i * SPACING;
          const angleDeg = Math.sin(frame * ((2 * Math.PI) / period)) * SWING_DEG;
          const angleRad = (angleDeg * Math.PI) / 180;
          const bobX = pivotX + Math.sin(angleRad) * ROD_LEN;
          const bobY = PIVOT_Y + Math.cos(angleRad) * ROD_LEN;
          return (
            <g key={i}>
              <circle cx={pivotX} cy={PIVOT_Y} r={5} fill="var(--ink-5)" />
              <line x1={pivotX} y1={PIVOT_Y} x2={bobX} y2={bobY} stroke="var(--ink-35)" strokeWidth={2} />
              <circle cx={bobX} cy={bobY} r={16} fill={i === 1 ? accent : "var(--ink)"}
                      style={{ filter: `drop-shadow(0 0 6px ${i === 1 ? accent : "var(--ink-5)"})` }} />
            </g>
          );
        })}
      </svg>

      {scene.pendulumNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pendulumNote}
        </div>
      )}

      {centerCrossFrames.map((f, i) => (
        <Sequence key={`${f}-${i}`} from={f} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.13} />
        </Sequence>
      ))}
    </div>
  );
};
