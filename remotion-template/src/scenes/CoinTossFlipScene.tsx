import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxWhoosh, sfxTick } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const GROUND_Y = 230;
const PEAK_Y = 50;
const FLIGHT_FRAMES = 70;

// Moeda lançada que sobe em arco girando rapidamente no eixo e cai, se assentando e
// revelando cara ou coroa, sem foto de fundo. Use pra SORTE, ACASO ou decisão de 50/50.
export const CoinTossFlipScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const result = scene.coinResult || "cara";

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(frame, [0, FLIGHT_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arc = 4 * t * (1 - t); // 0 -> 1 -> 0, pico em t=0.5
  const y = GROUND_Y - (GROUND_Y - PEAK_Y) * arc;
  const scale = 1 + 0.25 * arc;
  const flying = frame < FLIGHT_FRAMES;
  const scaleX = flying ? Math.cos(frame * 0.9) : 1;
  const bounce = interpolate(frame, [FLIGHT_FRAMES, FLIGHT_FRAMES + 8, FLIGHT_FRAMES + 14], [0, -10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOp = interpolate(frame, [FLIGHT_FRAMES + 4, FLIGHT_FRAMES + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [FLIGHT_FRAMES + 20, FLIGHT_FRAMES + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.14} />
      </Sequence>
      <Sequence from={FLIGHT_FRAMES} durationInFrames={4} layout="none">
        <Audio src={sfxTick(1800)} volume={0.14} />
      </Sequence>
      {scene.coinLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.coinLabel}
        </div>
      )}

      <svg width={320} height={300} viewBox="0 0 320 300">
        <g transform={`translate(160, ${y + bounce}) scale(${scaleX * scale}, ${scale})`}>
          <circle r={85} fill={accent} stroke="rgba(0,0,0,0.3)" strokeWidth={6}
                  style={{ filter: `drop-shadow(0 0 20px ${accent}90)` }} />
          <circle r={65} fill="none" stroke="var(--ink-4)" strokeWidth={3} />
          {!flying && (
            <text x={0} y={10} textAnchor="middle" fontSize={30} fontWeight={900} fill="#1a1a1a" opacity={textOp}>
              {result.toUpperCase()}
            </text>
          )}
        </g>
      </svg>

      {scene.coinNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.coinNote}
        </div>
      )}
    </div>
  );
};
