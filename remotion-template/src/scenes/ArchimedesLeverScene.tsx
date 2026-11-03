import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact, sfxWhoosh } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const CENTER = SIZE / 2;
const FULCRUM_X = 110;
const FULCRUM_Y = 190;
const BAR_HALF = 150;

// Alavanca longa sobre um pequeno fulcro: pouca força na ponta longa levanta um bloco
// gigante na ponta curta. Use pra EFICIÊNCIA, pequeno esforço gerando grande resultado.
export const ArchimedesLeverScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const angle = interpolate(frame, [20, 70], [0, -16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rad = (angle * Math.PI) / 180;

  const dxLong = BAR_HALF * Math.cos(rad);
  const dyLong = BAR_HALF * Math.sin(rad);
  const dxShort = (BAR_HALF * 0.35) * Math.cos(rad);
  const dyShort = (BAR_HALF * 0.35) * Math.sin(rad);

  const rightX = FULCRUM_X + dxLong;
  const rightY = FULCRUM_Y + dyLong;
  const leftX = FULCRUM_X - dxShort;
  const leftY = FULCRUM_Y - dyShort;

  const forceOp = interpolate(frame, [12, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [78, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={20} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.14} />
      </Sequence>
      <Sequence from={70} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      {scene.leverLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.leverLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <polygon points={`${FULCRUM_X - 18},${FULCRUM_Y + 30} ${FULCRUM_X + 18},${FULCRUM_Y + 30} ${FULCRUM_X},${FULCRUM_Y}`}
                 fill="var(--ink-15)" stroke="var(--ink)" strokeWidth={3} />

        <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke="var(--ink)" strokeWidth={8} strokeLinecap="round" />

        <rect x={leftX - 26} y={leftY - 52} width={52} height={52} fill={accent}
              opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />

        <g opacity={forceOp}>
          <circle cx={rightX} cy={rightY - 20} r={9} fill="var(--ink)" />
          <line x1={rightX} y1={rightY - 20} x2={rightX} y2={rightY - 4} stroke="var(--ink)" strokeWidth={4} markerEnd="url(#arrow)" />
        </g>
        <defs>
          <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" />
          </marker>
        </defs>
      </svg>

      {scene.leverNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.leverNote}
        </div>
      )}
    </div>
  );
};
