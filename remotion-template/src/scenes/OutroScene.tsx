import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";
import { Sequence, Audio } from "remotion";
import { sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

// CTA reaproveita o mesmo template de card usado em CardScene (caixa translúcida +
// linha principal branca negrito + linha secundária dourada) em vez de um botão
// pill de cor sólida — no vídeo de referência o card de CTA tem o mesmo visual dos
// cards de conteúdo, o que faz ele não parecer um anúncio plugado no final.
export const OutroScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ fps, frame: frame - 5, config: { damping: 13, stiffness: 110 } });
  const cardY  = interpolate(p, [0, 1], [50, 0]);
  const cardOp = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp  = interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "60px 80px", boxSizing: "border-box", gap: 28 }}>
      <Sequence from={5} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.3)} volume={0.14} />
      </Sequence>
      <Sequence from={22} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
      {scene.channel && (
        <div style={{ opacity: cardOp, transform: `translateY(${cardY}px)`,
                      fontSize: 32, fontWeight: 700, color: accent,
                      letterSpacing: 3, textTransform: "uppercase" }}>
          {scene.channel}
        </div>
      )}

      <div style={{ opacity: cardOp, transform: `translateY(${cardY}px)`,
                    background: "var(--ink-045)", borderRadius: 28,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                    padding: "48px 60px", textAlign: "center", width: "88%" }}>
        <div style={{ fontSize: 58, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
          <BlurReveal text={scene.title || "Curtiu? Segue aí!"} startFrame={5} />
        </div>

        {scene.cta && (
          <>
            <div style={{ width: 60, height: 3, background: accent, margin: "20px auto 16px", borderRadius: 2 }} />
            <div style={{ opacity: ctaOp, fontSize: 34, fontWeight: 900, color: accent,
                          textTransform: "uppercase", letterSpacing: 2 }}>
              <BlurReveal text={scene.cta} startFrame={22} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
