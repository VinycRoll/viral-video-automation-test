import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxAlert } from "../utils/soundSynth";

const TRI_SIZE = 180;

// Triângulo de alerta pulsando, sem foto de fundo. Usado quando o roteiro aponta um
// ERRO COMUM ou RISCO a evitar (ex: "cuidado com esse erro", "isso pode te custar
// caro") — tom de advertência, diferente de "achievement" (positivo) e "scale" (comparação
// neutra entre duas opções).
export const AlertScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popP = spring({ fps, frame, config: { damping: 11, stiffness: 160 } });
  const scale = interpolate(popP, [0, 1], [0, 1]);
  const pulse = 1 + Math.sin(frame / 7) * 0.04;
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 30, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.alertLabel && (
        <div style={{ opacity: labelOp, fontSize: 28, fontWeight: 900, color: "#ff5252",
                      textAlign: "center", letterSpacing: 2, textShadow: SOFT_TEXT_SHADOW, textTransform: "uppercase" }}>
          {scene.alertLabel}
        </div>
      )}

      <div style={{ width: TRI_SIZE, height: TRI_SIZE, transform: `scale(${scale * pulse})`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={TRI_SIZE} height={TRI_SIZE} viewBox="0 0 24 24">
          <path d="M12 2L22 20H2L12 2Z" fill="#ff5252" style={{ filter: "drop-shadow(0 0 24px #ff525280)" }} />
          <text x="12" y="17.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0b0b10">!</text>
        </svg>
      </div>

      {scene.alertTitle && (
        <div style={{ opacity: titleOp, fontSize: 42, fontWeight: 900, color: "var(--ink)", textAlign: "center",
                      letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.alertTitle}
        </div>
      )}

      {scene.alertNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.alertNote}
        </div>
      )}

      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxAlert()} volume={0.2} />
      </Sequence>
    </div>
  );
};
