import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const GROUND_Y = 250;
const COMPRESS_END = 70;

// Pistão desce lentamente esmagando um elemento elástico até saltar/moldar numa nova
// forma. Use pra TRANSFORMAÇÃO SOB PRESSÃO (crise virando oportunidade).
export const HydraulicPressScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const compress = interpolate(frame, [15, COMPRESS_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pistonY = 30 + compress * 130;
  const squashY = 1 - compress * 0.65;
  const squashX = 1 + compress * 0.35;

  const bounce = spring({ frame: frame - COMPRESS_END, fps, config: { damping: 9, mass: 0.6 } });
  const finalScaleY = squashY + bounce * 0.5;
  const finalScaleX = squashX - bounce * 0.25;

  const noteOp = interpolate(frame, [COMPRESS_END + 20, COMPRESS_END + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={COMPRESS_END} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      {scene.pressLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pressLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <rect x={110} y={0} width={100} height={pistonY} fill="#5a5a5a" stroke="#888" strokeWidth={3} />
        <rect x={80} y={pistonY} width={160} height={20} fill="#777" stroke="#aaa" strokeWidth={2} />

        <g transform={`translate(160 ${GROUND_Y}) scale(${finalScaleX} ${finalScaleY}) translate(-160 ${-GROUND_Y})`}>
          <rect x={110} y={GROUND_Y - 60} width={100} height={60} rx={14} fill={accent}
                opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
          {scene.pressTitle && (
            <text x={160} y={GROUND_Y - 25} fill="var(--ink)" fontSize={16} fontWeight={800} textAnchor="middle">
              {scene.pressTitle}
            </text>
          )}
        </g>

        <line x1={40} y1={GROUND_Y} x2={280} y2={GROUND_Y} stroke="#444" strokeWidth={6} />
      </svg>

      {scene.pressNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pressNote}
        </div>
      )}
    </div>
  );
};
