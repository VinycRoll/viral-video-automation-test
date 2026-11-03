import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxResonance } from "../utils/soundSynth";

const SIZE = 320;
const R = 150;
const CX = SIZE / 2;
const CY = SIZE / 2;
const LOCK_FRAME = 90;

const hash = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Luneta vasculhando um céu estrelado até travar num astro distante, revelando
// anéis de brilho e linhas de medição. Use pra astronomia, distâncias cósmicas ou
// descobertas espaciais.
export const TelescopeStarScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const searchProgress = Math.min(frame, LOCK_FRAME) / LOCK_FRAME;
  const amplitude = 70 * (1 - searchProgress);
  const angle = frame * 0.16;
  const offsetX = Math.sin(angle) * amplitude;
  const offsetY = Math.cos(angle * 1.3) * amplitude * 0.6;

  const locked = frame >= LOCK_FRAME;
  const lockOp = interpolate(frame, [LOCK_FRAME, LOCK_FRAME + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetScale = interpolate(frame, [LOCK_FRAME, LOCK_FRAME + 20], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [LOCK_FRAME + 20, LOCK_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stars = Array.from({ length: 45 }).map((_, i) => ({
    x: CX + (hash(i) - 0.5) * SIZE,
    y: CY + (hash(i + 100) - 0.5) * SIZE,
    r: 1 + hash(i + 200) * 1.8,
  }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.13} />
      </Sequence>
      <Sequence from={LOCK_FRAME} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(520)} volume={0.17} />
      </Sequence>

      {scene.telescopeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.telescopeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <clipPath id="scopeClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="#02030a" stroke="var(--ink-2)" strokeWidth={3} />

        <g clipPath="url(#scopeClip)">
          <g transform={`translate(${locked ? 0 : offsetX}, ${locked ? 0 : offsetY})`}>
            {stars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--ink)" opacity={0.7} />
            ))}
          </g>

          {locked && (
            <g opacity={lockOp} transform={`scale(${targetScale})`} style={{ transformOrigin: `${CX}px ${CY}px` }}>
              <circle cx={CX} cy={CY} r={38} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.5} />
              <circle cx={CX} cy={CY} r={24} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.7} />
              <circle cx={CX} cy={CY} r={9} fill={accent} style={{ filter: `drop-shadow(0 0 18px ${accent})` }} />
            </g>
          )}
        </g>

        {locked && (
          <g opacity={lockOp}>
            <line x1={CX - R} y1={CY} x2={CX - R + 16} y2={CY} stroke={accent} strokeWidth={2} />
            <line x1={CX + R - 16} y1={CY} x2={CX + R} y2={CY} stroke={accent} strokeWidth={2} />
            <line x1={CX} y1={CY - R} x2={CX} y2={CY - R + 16} stroke={accent} strokeWidth={2} />
            <line x1={CX} y1={CY + R - 16} x2={CX} y2={CY + R} stroke={accent} strokeWidth={2} />
          </g>
        )}

        {locked && scene.telescopeTargetLabel && (
          <text x={CX} y={CY + 56} fill="var(--ink)" fontSize={18} fontWeight={700} textAnchor="middle" opacity={lockOp}>
            {scene.telescopeTargetLabel}
          </text>
        )}
      </svg>

      {scene.telescopeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.telescopeNote}
        </div>
      )}
    </div>
  );
};
