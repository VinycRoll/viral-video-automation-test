import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBubble } from "../utils/soundSynth";

const CYCLE = 90;
const FALL_FRAMES = 40;
const SURFACE_Y = 200;
const RING_COUNT = 4;

// Gota que cai do topo e, ao atingir uma superfície no centro, dispara ondas circulares
// que se expandem perdendo opacidade; o ciclo se repete se a cena for longa, sem foto de
// fundo. Use pra EFEITO CASCATA de uma ação pequena (uma decisão que se propaga).
export const DropletRippleScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const local = frame % CYCLE;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [FALL_FRAMES + 10, FALL_FRAMES + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dropOp = local < FALL_FRAMES ? 1 : 0;
  const t = Math.min(local / FALL_FRAMES, 1);
  const dropY = -20 + 220 * t * t;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {Array.from({ length: 4 }).map((_, c) => (
        <Sequence key={c} from={c * CYCLE + FALL_FRAMES} durationInFrames={6} layout="none">
          <Audio src={sfxBubble()} volume={0.16} />
        </Sequence>
      ))}

      {scene.dropletLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dropletLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        <line x1={20} y1={SURFACE_Y} x2={300} y2={SURFACE_Y} stroke="var(--ink-15)" strokeWidth={2} />

        {dropOp > 0 && (
          <ellipse cx={160} cy={dropY} rx={10} ry={16} fill={accent}
                   style={{ filter: `drop-shadow(0 0 10px ${accent}90)` }} />
        )}

        {Array.from({ length: RING_COUNT }).map((_, k) => {
          const delay = k * 6;
          const r = interpolate(local, [FALL_FRAMES + delay, FALL_FRAMES + delay + 40], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const op = interpolate(local, [FALL_FRAMES + delay, FALL_FRAMES + delay + 40], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <circle key={k} cx={160} cy={SURFACE_Y} r={r} fill="none" stroke={accent} strokeWidth={3} opacity={op} />;
        })}
      </svg>

      {scene.dropletNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dropletNote}
        </div>
      )}
    </div>
  );
};
