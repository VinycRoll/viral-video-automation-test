import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z";
const STAR_SIZE = 76;
const STAR_GAP = 14;
const STAR_STAGGER = 8; // frames entre cada estrela "pipocando"

// Uma estrela que entra com spring (pop) e revela o preenchimento em accent até
// `fillFrac` (0-1) via clipPath — permite meia-estrela (ex: nota 4.5).
const Star: React.FC<{ index: number; fillFrac: number; accent: string }> = ({ index, fillFrac, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const popP = spring({ fps, frame: frame - index * STAR_STAGGER, config: { damping: 10, stiffness: 180 } });
  const scale = interpolate(popP, [0, 1], [0, 1]);

  return (
    <div style={{ position: "relative", width: STAR_SIZE, height: STAR_SIZE, transform: `scale(${scale})` }}>
      <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
        <path d={STAR_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.4} />
      </svg>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - fillFrac) * 100}% 0 0)` }}>
        <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24"
             style={{ filter: `drop-shadow(0 0 8px ${accent}90)` }}>
          <path d={STAR_PATH} fill={accent} />
        </svg>
      </div>
    </div>
  );
};

// Avaliação em estrelas (estilo native-ui) — estrelas "pipocam" em sequência e revelam
// o preenchimento até a nota, sem foto de fundo. Usado quando o roteiro cita uma nota,
// avaliação ou aprovação (ex: "nota 4.8", "a maioria aprova isso").
export const RatingScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const value = Math.max(0, Math.min(5, scene.ratingValue ?? 5));

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const valueOp = interpolate(frame, [44, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [52, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28 }}>
      {scene.ratingLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.ratingLabel}
        </div>
      )}

      <div style={{ display: "flex", gap: STAR_GAP }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} index={i} fillFrac={Math.max(0, Math.min(1, value - i))} accent={accent} />
        ))}
      </div>

      <div style={{ opacity: valueOp, fontSize: 56, fontWeight: 900, color: "#fff",
                    fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
        {value.toFixed(1).replace(".", ",")}
        <span style={{ fontSize: 30, color: accent }}>/5</span>
      </div>

      {scene.ratingNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.ratingNote}
        </div>
      )}
    </div>
  );
};
