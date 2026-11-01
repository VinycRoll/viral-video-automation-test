import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const STEP_GAP = 16; // frames entre cada marco acendendo

const Dot: React.FC<{ label: string; index: number; accent: string }> = ({ label, index, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = index * STEP_GAP;
  const p = spring({ fps, frame: frame - start, config: { damping: 11, stiffness: 180 } });
  const scale = interpolate(p, [0, 1], [0, 1]);
  const labelOp = interpolate(frame, [start + 4, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, flex: 1 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", transform: `scale(${scale})`,
                    background: accent, boxShadow: `0 0 16px ${accent}90` }} />
      <div style={{ opacity: labelOp, fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center",
                    letterSpacing: 0.2, textShadow: SOFT_TEXT_SHADOW, padding: "0 6px" }}>
        {label}
      </div>
    </div>
  );
};

// Linha do tempo horizontal com marcos acendendo em sequência, sem foto de fundo. Usado
// quando o roteiro descreve uma JORNADA ou PLANO em etapas (ex: "sua reserva em 3
// passos", "o caminho até a independência financeira") — diferente de "checklist"
// (tarefas marcando check) e "calendar" (uma data só).
export const RoadmapScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const steps = scene.roadmapSteps || [];
  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineEnd = Math.max(0, (steps.length - 1) * STEP_GAP + 6);
  const lineP = interpolate(frame, [6, lineEnd], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [lineEnd + 20, lineEnd + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 48, padding: "0 70px", boxSizing: "border-box" }}>
      {scene.roadmapTitle && (
        <div style={{ opacity: titleOp, fontSize: 32, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.roadmapTitle}
        </div>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "flex-start" }}>
        <div style={{ position: "absolute", left: "10%", right: "10%", top: 13, height: 4,
                      background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: "10%", top: 13, height: 4, width: `${lineP * 0.8}%`,
                      background: accent, borderRadius: 2, boxShadow: `0 0 10px ${accent}80` }} />
        {steps.map((s, i) => (
          <Dot key={i} label={s.label} index={i} accent={accent} />
        ))}
      </div>

      {scene.roadmapNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.roadmapNote}
        </div>
      )}
    </div>
  );
};
