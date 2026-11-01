import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const LEFT_R = 50;

// Dois círculos lado a lado em escalas muito diferentes, com zoom-out revelando a
// diferença de tamanho, sem foto de fundo. Usado pra fatos de ESCALA/TAMANHO (ex:
// comparar o tamanho de dois objetos, animais, prédios) — diferente de "scale" (que
// pende pra um lado, julgando qual é "melhor") e "split" (valores abstratos, não
// tamanho físico).
export const SizeComparisonScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ratio = Math.max(1, scene.sizeRatio ?? 20);
  const rightR = Math.min(LEFT_R * Math.sqrt(ratio), 420);

  const zoomP = spring({ fps, frame, config: { damping: 14, stiffness: 60 } });
  const zoomScale = interpolate(zoomP, [0, 1], [1.5, 1]);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.sizeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.sizeLabel}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 36,
                    transform: `scale(${zoomScale})`, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: LEFT_R * 2, height: LEFT_R * 2, borderRadius: "50%",
                        background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", textAlign: "center",
                        textShadow: SOFT_TEXT_SHADOW }}>
            {scene.sizeLeftValue}
          </div>
          {scene.sizeLeftLabel && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.65)",
                          textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
              {scene.sizeLeftLabel}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: rightR * 2, height: rightR * 2, borderRadius: "50%",
                        background: `${accent}30`, border: `3px solid ${accent}`,
                        boxShadow: `0 0 36px ${accent}50` }} />
          <div style={{ fontSize: 26, fontWeight: 900, color: accent, textAlign: "center",
                        textShadow: SOFT_TEXT_SHADOW }}>
            {scene.sizeRightValue}
          </div>
          {scene.sizeRightLabel && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.65)",
                          textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
              {scene.sizeRightLabel}
            </div>
          )}
        </div>
      </div>

      {scene.sizeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: "#fff",
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.sizeNote}
        </div>
      )}
    </div>
  );
};
