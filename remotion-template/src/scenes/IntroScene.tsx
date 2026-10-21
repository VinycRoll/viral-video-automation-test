import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Scene } from "../types";
import { TEXT_OUTLINE } from "../utils/text";

export const IntroScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const channelOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const channelY  = interpolate(frame, [0, 15], [-30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const tp = spring({ fps, frame: frame - 10, config: { damping: 14, stiffness: 120 } });
  const titleY  = interpolate(tp, [0, 1], [60, 0]);
  const titleOp = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOp = interpolate(frame, [24, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY  = interpolate(frame, [24, 38], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const lineW = interpolate(frame, [32, 52], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "flex-start", justifyContent: "center", padding: "60px 80px", boxSizing: "border-box" }}>
      {scene.channel && (
        <div style={{ opacity: channelOp, transform: `translateY(${channelY}px)`, fontSize: 28,
                      fontWeight: 700, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>
          {scene.channel}
        </div>
      )}

      <div style={{ width: `${lineW}%`, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, marginBottom: 28 }} />

      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontSize: 80, fontWeight: 900,
                    color: "#fff", lineHeight: 1.1, textTransform: "uppercase", letterSpacing: -1, maxWidth: "90%",
                    marginBottom: 20, textShadow: TEXT_OUTLINE }}>
        {scene.title}
      </div>

      {scene.subtitle && (
        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, fontSize: 32,
                      fontWeight: 500, color: "rgba(255,255,255,0.65)", maxWidth: "85%" }}>
          {scene.subtitle}
        </div>
      )}
    </div>
  );
};
