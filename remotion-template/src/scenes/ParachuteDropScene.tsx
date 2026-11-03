import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxImpact } from "../utils/soundSynth";

const SIZE = 320;
const OPEN_FRAME = 32;

// Objeto cai rápido e, no meio da tela, abre um paraquedas elástico que desacelera
// instantaneamente numa descida suave. Use pra FREADA DE EMERGÊNCIA, um resgate a tempo.
export const ParachuteDropScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fastFallY = interpolate(frame, [0, OPEN_FRAME], [-20, 130], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const slowFallY = interpolate(frame, [OPEN_FRAME, OPEN_FRAME + 60], [130, 230], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const objY = frame < OPEN_FRAME ? fastFallY : slowFallY;

  const chuteOpen = spring({ frame: frame - OPEN_FRAME, fps, config: { damping: 10, mass: 0.5 } });

  const noteOp = interpolate(frame, [OPEN_FRAME + 50, OPEN_FRAME + 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.25)} volume={0.14} />
      </Sequence>
      <Sequence from={OPEN_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact(0.3)} volume={0.2} />
      </Sequence>
      {scene.parachuteLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.parachuteLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {frame >= OPEN_FRAME && (
          <>
            <path d={`M ${160 - 70 * chuteOpen},${objY - 20} A ${70 * chuteOpen} ${50 * chuteOpen} 0 0 1 ${160 + 70 * chuteOpen},${objY - 20} Z`}
                  fill={accent} opacity={0.85} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
            <line x1={160 - 60 * chuteOpen} y1={objY - 20} x2={150} y2={objY} stroke="var(--ink)" strokeWidth={2} opacity={chuteOpen} />
            <line x1={160 + 60 * chuteOpen} y1={objY - 20} x2={170} y2={objY} stroke="var(--ink)" strokeWidth={2} opacity={chuteOpen} />
            <line x1={160} y1={objY - 20} x2={160} y2={objY} stroke="var(--ink)" strokeWidth={2} opacity={chuteOpen} />
          </>
        )}
        <rect x={140} y={objY} width={40} height={40} rx={8} fill="var(--ink)" opacity={0.95} />
        {scene.parachuteTitle && (
          <text x={160} y={objY + 25} fill="#222" fontSize={13} fontWeight={800} textAnchor="middle">
            {scene.parachuteTitle}
          </text>
        )}
      </svg>

      {scene.parachuteNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.parachuteNote}
        </div>
      )}
    </div>
  );
};
