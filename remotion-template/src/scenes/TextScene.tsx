import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { splitHighlightWords, colorForWord, TEXT_OUTLINE } from "../utils/text";

export const TextScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitHighlightWords(scene.text || "");

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "60px 80px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontSize: 74, fontWeight: 900, color: "rgba(255,255,255,0.95)",
                    lineHeight: 1.2, textTransform: "uppercase", letterSpacing: -1, textShadow: TEXT_OUTLINE }}>
        {words.map((word, i) => {
          const delay = i * 4;
          const p = spring({ fps, frame: frame - delay, config: { damping: 12, stiffness: 200 } });
          return (
            <span key={i} style={{
              display: "inline-block", marginRight: "0.25em", color: colorForWord(word.color, accent, "rgba(255,255,255,0.95)"),
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.4, 1])})`,
            }}>
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
