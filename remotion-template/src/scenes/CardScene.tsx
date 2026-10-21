import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { TEXT_OUTLINE } from "../utils/text";

export const CardScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cp = spring({ fps, frame: frame - 5, config: { damping: 14, stiffness: 130 } });
  const cardScale = interpolate(cp, [0, 1], [0.75, 1]);
  const cardOp    = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const vp = spring({ fps, frame: frame - 22, config: { damping: 10, stiffness: 120 } });
  const valScale = interpolate(vp, [0, 1], [0.5, 1]);
  const valOp    = interpolate(frame, [22, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteY  = interpolate(frame, [36, 48], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 80px",
                  boxSizing: "border-box", gap: 32 }}>

      <div style={{ opacity: cardOp, transform: `scale(${cardScale})`,
                    background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)",
                    borderRadius: 20, padding: "40px 60px", textAlign: "center", width: "88%" }}>
        {scene.cardTitle && (
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            {scene.cardTitle}
          </div>
        )}
        <div style={{ width: 60, height: 3, background: accent, margin: "0 auto 20px", borderRadius: 2 }} />
        {scene.cardValue && (
          <div style={{ opacity: valOp, transform: `scale(${valScale})`,
                        fontSize: 100, fontWeight: 900, color: "#FF4444", lineHeight: 1, letterSpacing: -2,
                        textShadow: TEXT_OUTLINE }}>
            {scene.cardValue}
          </div>
        )}
      </div>

      {scene.cardNote && (
        <div style={{ opacity: noteOp, transform: `translateY(${noteY}px)`,
                      fontSize: 36, fontWeight: 700, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
          {scene.cardNote}
        </div>
      )}
    </div>
  );
};
