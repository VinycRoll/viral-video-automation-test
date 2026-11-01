import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const BLOCK_W = 22;
const BLOCK_H = 140;
const GAP = 34;
const START_FRAME = 8;
const STAGGER = 5;
const TIP_DEG = 78;

// Fileira de blocos minimalistas que tombam em cadeia, um derrubando o seguinte — use
// pra ilustrar causa-e-efeito (um evento pequeno gerando uma consequência grande),
// diferente de "treebranch" (uma coisa se multiplicando em várias, não uma cadeia linear).
export const DominoEffectScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = scene.dominoCount ?? 6;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteStart = START_FRAME + count * STAGGER + 20;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const totalW = count * BLOCK_W + (count - 1) * GAP;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 40, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.dominoLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dominoLabel}
        </div>
      )}

      <div style={{ width: totalW, height: BLOCK_H, display: "flex", alignItems: "flex-end", gap: GAP }}>
        {Array.from({ length: count }).map((_, i) => {
          const tipP = spring({ fps, frame: frame - (START_FRAME + i * STAGGER), config: { damping: 14, stiffness: 120 } });
          const rotate = interpolate(tipP, [0, 1], [0, TIP_DEG]);
          return (
            <div key={i} style={{
              width: BLOCK_W, height: BLOCK_H, background: i % 2 === 0 ? accent : "rgba(255,255,255,0.75)",
              borderRadius: 4, transformOrigin: "0% 100%", transform: `rotate(${rotate}deg)`,
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }} />
          );
        })}
      </div>

      {scene.dominoNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.dominoNote}
        </div>
      )}
    </div>
  );
};
