import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const DRUM_R = 140;
const DEG_PER_FRAME = 7; // giro contínuo e rápido do tambor
const PARTICLE_COUNT = 18;
const SEPARATION_FRAMES = 90;

// Tambor circular girando em alta velocidade que separa partículas pesadas (migram pra
// borda) das leves (ficam concentradas no núcleo), sem foto de fundo. Use pra
// SEPARAÇÃO/FILTRAGEM do que importa vs. o que não importa.
export const CentrifugeSpinScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [SEPARATION_FRAMES + 20, SEPARATION_FRAMES + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drumAngle = frame * DEG_PER_FRAME;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.centrifugeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.centrifugeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CY} r={DRUM_R} fill="none" stroke="var(--ink-18)" strokeWidth={10} />
        <circle cx={CX} cy={CY} r={DRUM_R - 10} fill="none" stroke="var(--ink-08)" strokeWidth={2} />

        <g transform={`rotate(${drumAngle}, ${CX}, ${CY})`}>
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const isHeavy = i % 2 === 0;
            const baseAngle = (360 / PARTICLE_COUNT) * i;
            const rad = ((baseAngle - 90) * Math.PI) / 180;
            const initialR = 55 + 35 * Math.sin(i * 2.1);
            const targetR = isHeavy ? DRUM_R - 22 : 28;
            const r = interpolate(frame, [0, SEPARATION_FRAMES], [initialR, targetR], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const x = CX + r * Math.cos(rad);
            const y = CY + r * Math.sin(rad);
            const size = isHeavy ? 9 : 5;
            const fill = isHeavy ? "var(--ink-75)" : accent;

            return (
              <circle key={i} cx={x} cy={y} r={size} fill={fill}
                      style={!isHeavy ? { filter: `drop-shadow(0 0 8px ${accent}90)` } : undefined} />
            );
          })}
        </g>
      </svg>

      {scene.centrifugeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.centrifugeNote}
        </div>
      )}

      {[0, 25, 45, 60, 70, 78, 84].map((f, i) => (
        <Sequence key={f} from={f} durationInFrames={10} layout="none">
          <Audio src={sfxWhoosh()} volume={0.12 + i * 0.01} />
        </Sequence>
      ))}
    </div>
  );
};
