import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxWhoosh } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 300;
const CX = SIZE / 2;
const TOP = 50;
const NECK = SIZE / 2;
const BOTTOM = 250;
const HALF_W = 80;
const CYCLE = 150;
const GRAIN_COUNT = 6;
const FALL_WINDOW = 40;

// Ampulheta minimalista com grãos caindo continuamente pelo gargalo; o nível de
// areia sobe de um lado e desce do outro e, ao zerar, a estrutura gira 180° e o
// ciclo recomeça. Use pra TEMPO SE ESGOTANDO, prazos ou urgência.
export const HourglassSandScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cycleIndex = Math.floor(frame / CYCLE);
  const f = frame % CYCLE;
  const p = f / CYCLE;
  const flipProgress = interpolate(f, [CYCLE - 20, CYCLE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rotation = cycleIndex * 180 + flipProgress * 180;

  const topFill = 1 - p;
  const bottomFill = p;

  const noteOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {[10, 50].map((t) => (
        <Sequence key={t} from={t} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.08} />
        </Sequence>
      ))}
      <Sequence from={CYCLE - 20} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.14} />
      </Sequence>
      {scene.hourglassLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.hourglassLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${CX}px ${NECK}px` }}>
        <defs>
          <clipPath id="topClip">
            <polygon points={`${CX - HALF_W},${TOP} ${CX + HALF_W},${TOP} ${CX + 4},${NECK} ${CX - 4},${NECK}`} />
          </clipPath>
          <clipPath id="bottomClip">
            <polygon points={`${CX - 4},${NECK} ${CX + 4},${NECK} ${CX + HALF_W},${BOTTOM} ${CX - HALF_W},${BOTTOM}`} />
          </clipPath>
        </defs>

        <polygon points={`${CX - HALF_W},${TOP} ${CX + HALF_W},${TOP} ${CX + 4},${NECK} ${CX - 4},${NECK}`}
                 fill="none" stroke="var(--ink-4)" strokeWidth={3} />
        <polygon points={`${CX - 4},${NECK} ${CX + 4},${NECK} ${CX + HALF_W},${BOTTOM} ${CX - HALF_W},${BOTTOM}`}
                 fill="none" stroke="var(--ink-4)" strokeWidth={3} />
        <line x1={CX - HALF_W - 14} y1={TOP} x2={CX + HALF_W + 14} y2={TOP} stroke="var(--ink-4)" strokeWidth={4} />
        <line x1={CX - HALF_W - 14} y1={BOTTOM} x2={CX + HALF_W + 14} y2={BOTTOM} stroke="var(--ink-4)" strokeWidth={4} />

        <rect x={CX - HALF_W} y={TOP + (NECK - TOP) * (1 - topFill)} width={HALF_W * 2} height={(NECK - TOP) * topFill}
              fill={accent} opacity={0.75} clipPath="url(#topClip)" />
        <rect x={CX - HALF_W} y={BOTTOM - (BOTTOM - NECK) * bottomFill} width={HALF_W * 2} height={(BOTTOM - NECK) * bottomFill}
              fill={accent} opacity={0.75} clipPath="url(#bottomClip)" />

        {Array.from({ length: GRAIN_COUNT }).map((_, i) => {
          const phase = (i * (CYCLE / GRAIN_COUNT)) % CYCLE;
          const gf = (frame + phase) % FALL_WINDOW;
          const y = NECK - 20 + (gf / FALL_WINDOW) * 40;
          return <circle key={i} cx={CX + (i % 2 === 0 ? -2 : 2)} cy={y} r={2.5} fill={accent} />;
        })}
      </svg>

      {scene.hourglassNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.hourglassNote}
        </div>
      )}
    </div>
  );
};
