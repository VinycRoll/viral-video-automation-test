import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick } from "../utils/soundSynth";

const SIZE = 320;
const MESH_Y = 150;
const HOLES = [60, 100, 140, 180, 220, 260];

const PARTICLES = [
  { x: 50, big: true, start: 0 },
  { x: 90, big: false, start: 6 },
  { x: 130, big: true, start: 12 },
  { x: 160, big: false, start: 4 },
  { x: 200, big: false, start: 16 },
  { x: 230, big: true, start: 8 },
  { x: 270, big: false, start: 20 },
];

// Malha horizontal que treme lateralmente: partículas grandes ficam retidas em cima,
// pequenas atravessam e caem. Use pra FILTRAGEM, seleção do que é relevante vs. ruído.
export const SieveFilterScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const meshShake = Math.sin(frame / 2.2) * 4;
  const noteOp = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.sieveLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.sieveLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {PARTICLES.map((p, i) => {
          const r = p.big ? 11 : 6;
          const fallStart = p.start;
          const fallToMesh = interpolate(frame, [fallStart, fallStart + 30], [0, MESH_Y - r], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          let y = fallToMesh;
          if (!p.big) {
            const passT = interpolate(frame, [fallStart + 30, fallStart + 55], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            y = MESH_Y - r + passT * (SIZE - MESH_Y);
          }
          return (
            <circle key={i} cx={p.x} cy={y} r={r} fill={p.big ? "#888" : accent}
                    opacity={0.9} style={{ filter: p.big ? undefined : `drop-shadow(0 0 6px ${accent})` }} />
          );
        })}

        <g transform={`translate(${meshShake} 0)`}>
          {HOLES.map((x, i) => (
            <line key={i} x1={x - 12} y1={MESH_Y} x2={x + 12} y2={MESH_Y} stroke="#ccc" strokeWidth={6} />
          ))}
          <line x1={20} y1={MESH_Y} x2={300} y2={MESH_Y} stroke="#ccc" strokeWidth={2} opacity={0.4} />
        </g>
      </svg>

      {scene.sieveNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.sieveNote}
        </div>
      )}

      {[0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70].map((f) => (
        <Sequence key={f} from={f} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
    </div>
  );
};
