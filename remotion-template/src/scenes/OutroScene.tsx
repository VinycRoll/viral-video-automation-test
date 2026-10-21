import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { TEXT_OUTLINE } from "../utils/text";

export const OutroScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ fps, frame: frame - 5, config: { damping: 13, stiffness: 110 } });
  const titleY  = interpolate(p, [0, 1], [50, 0]);
  const titleOp = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp   = interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse   = interpolate(Math.sin((frame / 30) * Math.PI), [-1, 1], [0.97, 1.03]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "60px 80px", boxSizing: "border-box", gap: 36 }}>

      {scene.channel && (
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`,
                      fontSize: 32, fontWeight: 700, color: accent,
                      letterSpacing: 3, textTransform: "uppercase" }}>
          {scene.channel}
        </div>
      )}

      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`,
                    fontSize: 72, fontWeight: 900, color: "#fff",
                    textAlign: "center", textTransform: "uppercase", letterSpacing: -1, textShadow: TEXT_OUTLINE }}>
        {scene.title || "Curtiu? Segue aí!"}
      </div>

      {scene.cta && (
        <div style={{ opacity: ctaOp, transform: `scale(${pulse})`, background: accent,
                      color: "#0D0D1A", fontSize: 34, fontWeight: 900,
                      padding: "18px 48px", borderRadius: 60, textTransform: "uppercase", letterSpacing: 2 }}>
          {scene.cta}
        </div>
      )}
    </div>
  );
};
