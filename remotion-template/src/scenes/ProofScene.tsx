import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";
import { sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

const BAR_STAGGER = 14; // frames entre o início de cada barra

// "Prova" com UI nativa de app (barras com números reais, ex: regra 50/30/20) em vez
// de foto de banco de imagem — inspirado no cartão de barras do vídeo de referência
// (/home/vinycius/film): dado concreto > metáfora visual genérica do Pixabay.
export const ProofScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = scene.proofBars || [];

  const cardOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastBarDelay = 16 + Math.max(0, bars.length - 1) * BAR_STAGGER;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 70px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.25)} volume={0.14} />
      </Sequence>
      <Sequence from={lastBarDelay + 20} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
      <div style={{ opacity: cardOp, background: "var(--ink-045)", borderRadius: 28,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                    padding: "44px 48px", width: "90%", boxSizing: "border-box" }}>
        {scene.proofTitle && (
          <div style={{ fontSize: 38, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)", marginBottom: 32,
                        textAlign: "center", letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
            <BlurReveal text={scene.proofTitle} startFrame={0} />
          </div>
        )}

        {bars.map((bar, i) => {
          const delay = 16 + i * BAR_STAGGER;
          const p = spring({ fps, frame: frame - delay, config: { damping: 16, stiffness: 90 } });
          const fillPct = interpolate(p, [0, 1], [0, Math.max(0, Math.min(100, bar.pct))]);
          const rowOp = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: rowOp, marginBottom: i === bars.length - 1 ? 0 : 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10,
                            fontSize: 26, fontWeight: 700, color: "var(--ink-75)", letterSpacing: 0.5 }}>
                <span>{bar.label}</span>
                <span style={{ color: accent, fontWeight: 900 }}>{bar.value}</span>
              </div>
              <div style={{ width: "100%", height: 16, borderRadius: 8, background: "var(--ink-08)" }}>
                <div style={{ width: `${fillPct}%`, height: "100%", borderRadius: 8, background: accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
