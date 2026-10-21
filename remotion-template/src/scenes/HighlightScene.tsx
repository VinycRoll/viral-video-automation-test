import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { splitHighlightWords, colorForWord, TEXT_OUTLINE } from "../utils/text";

export const HighlightScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitHighlightWords(scene.text || "");

  const lineW = interpolate(frame, [12, 32], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 80px",
                  boxSizing: "border-box", textAlign: "center", gap: 24 }}>

      <div style={{ width: `${lineW}%`, height: 4,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, borderRadius: 2 }} />

      <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", lineHeight: 1.15,
                    textTransform: "uppercase", letterSpacing: -1, maxWidth: "95%", textShadow: TEXT_OUTLINE }}>
        {words.map((word, i) => {
          const delay = 4 + i * 4;
          const p = spring({ fps, frame: frame - delay, config: { damping: 11, stiffness: 220 } });
          return (
            <span key={i} style={{
              display: "inline-block", marginRight: "0.28em", color: colorForWord(word.color, accent, "#fff"),
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p, [0, 1], [45, 0])}px) scale(${interpolate(p, [0, 1], [0.35, 1])})`,
            }}>
              {word.text}
            </span>
          );
        })}
      </div>

      <div style={{ width: `${lineW}%`, height: 4,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, borderRadius: 2 }} />
    </div>
  );
};
