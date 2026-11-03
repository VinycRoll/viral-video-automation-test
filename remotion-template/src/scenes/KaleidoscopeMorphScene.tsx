import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxResonance } from "../utils/soundSynth";

const SIZE = 320;
const CENTER = SIZE / 2;
const COPIES = 7;

// Formas geométricas simétricas girando e se multiplicando a partir do centro em
// espelhamento radial. Use pra PADRÕES hipnóticos ou transição/respiro visual puro.
export const KaleidoscopeMorphScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bloom = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = frame * 1.6;
  const pulse = 0.85 + 0.15 * Math.sin(frame / 14);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(520, 0.7)} volume={0.13} />
      </Sequence>
      {scene.kaleidoscopeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.kaleidoscopeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {Array.from({ length: COPIES }).map((_, i) => {
          const baseAngle = (360 / COPIES) * i;
          const angle = baseAngle + spin;
          const dist = 55 * bloom * pulse;
          const rad = (angle * Math.PI) / 180;
          const x = CENTER + Math.cos(rad) * dist;
          const y = CENTER + Math.sin(rad) * dist;
          const shapeRot = angle * 2;
          const size = 34 * bloom;
          const color = i % 2 === 0 ? accent : "var(--ink-55)";
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${shapeRot})`}>
              <polygon
                points={`0,${-size} ${size * 0.87},${size * 0.5} ${-size * 0.87},${size * 0.5}`}
                fill={color}
                opacity={0.85}
                style={{ filter: i % 2 === 0 ? `drop-shadow(0 0 10px ${accent})` : undefined }}
              />
            </g>
          );
        })}
        <circle cx={CENTER} cy={CENTER} r={10 * bloom} fill="var(--ink)" opacity={0.9} />
      </svg>

      {scene.kaleidoscopeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.kaleidoscopeNote}
        </div>
      )}
    </div>
  );
};
