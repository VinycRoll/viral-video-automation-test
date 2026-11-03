import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxBeep } from "../utils/soundSynth";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 110;

// Visor circular com mira graduada que emerge de baixo, gira procurando um alvo e trava
// com zoom. Use pra OBSERVAÇÃO discreta ou buscar algo escondido da vista comum.
export const PeriscopeViewScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const emergeY = interpolate(frame, [0, 20], [SIZE, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const searchX = interpolate(frame, [20, 55], [-40, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [55, 68], [1, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetOp = interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.14} />
      </Sequence>
      <Sequence from={55} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1400, 0.1)} volume={0.16} />
      </Sequence>

      {scene.periscopeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.periscopeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: `translateY(${emergeY}px)` }}>
        <defs>
          <clipPath id="periscope-clip">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </clipPath>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#0a0a0a" stroke={accent} strokeWidth={6} />
        <g clipPath="url(#periscope-clip)">
          <g transform={`translate(${searchX} 0) scale(${zoom})`} style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
            <rect x={0} y={150} width={SIZE} height={170} fill="#1a2a1a" />
            <circle cx={CENTER} cy={CENTER - 10} r={18} fill={accent} opacity={targetOp}
                    style={{ filter: `drop-shadow(0 0 12px ${accent})` }} />
          </g>
        </g>
        <line x1={CENTER - RADIUS} y1={CENTER} x2={CENTER + RADIUS} y2={CENTER} stroke="var(--ink)" strokeWidth={1} opacity={0.4} />
        <line x1={CENTER} y1={CENTER - RADIUS} x2={CENTER} y2={CENTER + RADIUS} stroke="var(--ink)" strokeWidth={1} opacity={0.4} />
        {scene.periscopeTargetLabel && (
          <text x={CENTER} y={CENTER + RADIUS + 28} fill="var(--ink)" fontSize={18} fontWeight={800}
                textAnchor="middle" opacity={targetOp}>
            {scene.periscopeTargetLabel}
          </text>
        )}
      </svg>

      {scene.periscopeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.periscopeNote}
        </div>
      )}
    </div>
  );
};
