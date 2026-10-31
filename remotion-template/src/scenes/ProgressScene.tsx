import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 340;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

// Anel de progresso enchendo até a porcentagem alvo, com contador numérico no centro
// subindo em sincronia com o preenchimento (estilo native-ui/motionmaxxing). Usado
// quando o roteiro cita uma meta ou percentual de progresso.
export const ProgressScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const target = Math.max(0, Math.min(100, scene.progressPct ?? 50));

  const ringP = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 55 }, durationInFrames: 50 });
  const pct = interpolate(ringP, [0, 1], [0, target]);
  const dashoffset = CIRC - (pct / 100) * CIRC;

  const ringOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36 }}>
      {scene.progressLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.progressLabel}
        </div>
      )}

      <div style={{ position: "relative", width: SIZE, height: SIZE, opacity: ringOp }}>
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
            stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
            stroke={accent} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={dashoffset}
            style={{ filter: `drop-shadow(0 0 14px ${accent}90)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 86, fontWeight: 900, color: "#fff", letterSpacing: -2,
                        fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
            {Math.round(pct)}<span style={{ fontSize: 44, color: accent }}>%</span>
          </div>
        </div>
      </div>

      {scene.progressNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.progressNote}
        </div>
      )}
    </div>
  );
};
