import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxStatic } from "../utils/soundSynth";

const GLITCH_START = 30;
const GLITCH_LEN = 14;
const REVEAL_START = GLITCH_START + GLITCH_LEN;

// hash determinístico pra gerar deslocamentos "aleatórios" por frame sem Math.random
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Texto estável que sofre um glitch rápido (RGB split + linhas de ruído) e revela outro
// texto por trás, sem foto de fundo. Use pra virar uma afirmação comum ("o que te
// disseram") no seu contrário real num corte seco — diferente de "censoredreveal" (uma
// tarja física sendo removida, não um efeito digital).
export const GlitchSystemScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const inGlitch = frame >= GLITCH_START && frame < REVEAL_START;
  const revealed = frame >= REVEAL_START;

  const introOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteStart = REVEAL_START + 20;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const text = revealed ? scene.glitchReveal : scene.glitchLabel;
  const color = revealed ? accent : "var(--ink)";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: 640, minHeight: 90, display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
        {!inGlitch && text && (
          <div style={{ opacity: introOp, fontSize: 40, fontWeight: 800, fontFamily: SERIF_FONT, color,
                        textAlign: "center", textShadow: SOFT_TEXT_SHADOW }}>
            {text}
          </div>
        )}

        {inGlitch && scene.glitchLabel && (
          <>
            {[0, 1, 2].map((i) => {
              const dx = (hash(frame * 3.7 + i * 11.3) - 0.5) * 26;
              const dy = (hash(frame * 5.1 + i * 7.9) - 0.5) * 6;
              const tint = i === 0 ? "#ff3366" : i === 1 ? "#33e6ff" : "var(--ink)";
              return (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, fontSize: 40, fontWeight: 800,
                                       fontFamily: SERIF_FONT, color: tint, mixBlendMode: "screen",
                                       textAlign: "center", transform: `translate(${dx}px, ${dy}px)` }}>
                  {scene.glitchLabel}
                </div>
              );
            })}
            {[0, 1, 2].map((i) => (
              (frame + i * 2) % 3 === 0 && (
                <div key={`n${i}`} style={{ position: "absolute", left: 0, right: 0,
                                             top: `${20 + i * 30 + hash(frame + i) * 10}%`,
                                             height: 3, background: "var(--ink-18)" }} />
              )
            ))}
          </>
        )}
      </div>

      {scene.glitchNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.glitchNote}
        </div>
      )}

      <Sequence from={GLITCH_START} durationInFrames={GLITCH_LEN} layout="none">
        <Audio src={sfxStatic(GLITCH_LEN / 30)} volume={0.1} />
      </Sequence>
    </div>
  );
};
