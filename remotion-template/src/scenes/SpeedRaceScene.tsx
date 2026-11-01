import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const LANE_W = 560;

const Lane: React.FC<{ label: string; value?: string; speed: number; accent: string; highlight: boolean }> = ({
  label, value, speed, accent, highlight,
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [6, 6 + 110 / Math.max(0.1, speed)], [0, LANE_W - 22], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: LANE_W }}>
      <div style={{ opacity: labelOp, display: "flex", justifyContent: "space-between",
                    fontSize: 20, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>
        <span>{label}</span>
        {value && <span style={{ color: highlight ? accent : "#fff" }}>{value}</span>}
      </div>
      <div style={{ position: "relative", width: "100%", height: 10, borderRadius: 5,
                    background: "rgba(255,255,255,0.1)" }}>
        <div style={{ position: "absolute", left: x, top: -6, width: 22, height: 22, borderRadius: "50%",
                      background: highlight ? accent : "#fff",
                      boxShadow: highlight ? `0 0 14px ${accent}90` : "0 0 8px rgba(255,255,255,0.5)" }} />
      </div>
    </div>
  );
};

// 2-3 faixas horizontais com um ponto correndo da esquerda pra direita em velocidades
// diferentes, sem foto de fundo. Usado pra comparar a RAPIDEZ de coisas distintas (ex:
// "o som viaja a 340 m/s, a luz a 300.000 km/s") — diferente de "scale" (não é sobre
// velocidade) e "split" (estático, sem corrida).
export const SpeedRaceScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const items = scene.raceItems || [];
  const fastestIdx = items.reduce((best, it, i) => (it.speed > (items[best]?.speed ?? -Infinity) ? i : best), 0);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 30, padding: "0 40px", boxSizing: "border-box" }}>
      {scene.raceLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.raceLabel}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {items.map((it, i) => (
          <Lane key={i} label={it.label} value={it.value} speed={it.speed} accent={accent} highlight={i === fastestIdx} />
        ))}
      </div>

      {scene.raceNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.raceNote}
        </div>
      )}
    </div>
  );
};
