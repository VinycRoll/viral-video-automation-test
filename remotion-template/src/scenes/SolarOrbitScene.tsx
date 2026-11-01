import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const STAGE = 320;

const Satellite: React.FC<{ label: string; index: number; accent: string }> = ({ label, index, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const radius = 90 + index * 50;
  const speed = (index + 1) * 0.9;
  const phase = index * 2.1;
  const angle = (frame / fps) * speed + phase;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.55;

  const popP = spring({ fps, frame: frame - index * 6, config: { damping: 12, stiffness: 160 } });
  const scale = interpolate(popP, [0, 1], [0, 1]);

  return (
    <div style={{ position: "absolute", left: STAGE / 2 + x, top: STAGE / 2 + y, transform: `translate(-50%, -50%) scale(${scale})`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: accent,
                    boxShadow: `0 0 12px ${accent}90` }} />
      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", whiteSpace: "nowrap",
                    textShadow: SOFT_TEXT_SHADOW }}>
        {label}
      </div>
    </div>
  );
};

// Núcleo central com 2-3 elementos orbitando em círculos, sem foto de fundo. Usado pra
// conceitos CENTRAIS com coisas girando em torno (ex: planetas, átomo, "tudo gira em
// torno da sua reserva de emergência") — diferente de "proof"/"split" (estáticos, sem
// movimento orbital).
export const SolarOrbitScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = scene.orbitItems || [];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const coreP = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const noteOp = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 30, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.orbitLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.orbitLabel}
        </div>
      )}

      <div style={{ position: "relative", width: STAGE, height: STAGE }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${interpolate(coreP, [0, 1], [0, 1])})`,
                      width: 90, height: 90, borderRadius: "50%", background: accent,
                      boxShadow: `0 0 36px ${accent}80`, display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 8, textAlign: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#0b0b10" }}>{scene.orbitCenterLabel}</span>
        </div>
        {items.map((it, i) => (
          <Satellite key={i} label={it.label} index={i} accent={accent} />
        ))}
      </div>

      {scene.orbitNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.orbitNote}
        </div>
      )}
    </div>
  );
};
