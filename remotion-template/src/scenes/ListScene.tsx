import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { parseText, TEXT_OUTLINE } from "../utils/text";

export const ListScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = scene.items || [];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "flex-start", justifyContent: "center",
                  padding: "60px 80px", boxSizing: "border-box", gap: 28 }}>
      {items.map((item, i) => {
        const delay = i * 10;
        const p = spring({ fps, frame: frame - delay, config: { damping: 14, stiffness: 120 } });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20,
                                 opacity: interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                                 transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)` }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: accent,
                          flexShrink: 0, boxShadow: `0 0 12px ${accent}` }} />
            <div style={{ fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2, textShadow: TEXT_OUTLINE }}>
              {parseText(item, accent)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
