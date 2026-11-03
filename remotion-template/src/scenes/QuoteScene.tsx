import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

// Citação editorial com aspas grandes de destaque, sem foto de fundo. Usado quando o
// roteiro cita uma frase de autoridade/dado curto pra reforçar o argumento (ex: "como
// diz Warren Buffett...") — diferente de "highlight" (frase do próprio roteiro em
// destaque) e "text" (texto simples de transição).
export const QuoteScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const markOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const authorStart = 10 + Math.min(60, (scene.quoteText || "").length) * 1.2;
  const authorOp = interpolate(frame, [authorStart, authorStart + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 20, padding: "0 90px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.2)} volume={0.13} />
      </Sequence>
      <div style={{ opacity: markOp, fontSize: 140, fontWeight: 900, color: accent, lineHeight: 0.6,
                    fontFamily: SERIF_FONT, textShadow: `0 0 36px ${accent}40` }}>
        “
      </div>
      <div style={{ fontSize: 46, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)", fontStyle: "italic",
                    textAlign: "center", lineHeight: 1.25, letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
        <BlurReveal text={scene.quoteText || ""} startFrame={8} durationInFrames={26} />
      </div>
      {scene.quoteAuthor && (
        <div style={{ opacity: authorOp, marginTop: 10, fontSize: 28, fontWeight: 800, color: accent,
                      textTransform: "uppercase", letterSpacing: 1.5, textShadow: SOFT_TEXT_SHADOW }}>
          — {scene.quoteAuthor}
        </div>
      )}
    </div>
  );
};
