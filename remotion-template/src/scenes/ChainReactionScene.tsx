import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick } from "../utils/soundSynth";

const ROW_GAP = 46;
const ROUND_STAGGER = 12;
const START_FRAME = 8;
const AREA_W = 760;

// Um ponto se multiplica em cadeia (1 -> 2 -> 4 -> 8...), rodada por rodada — use pra
// ilustrar efeito composto / crescimento exponencial, diferente de "domino" (cadeia
// linear causa-efeito) e "treebranch" (ramificação única, não dobra geometricamente).
export const ChainReactionScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rounds = scene.chainRounds ?? 5;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastRoundFrame = START_FRAME + (rounds - 1) * ROUND_STAGGER;
  const noteStart = lastRoundFrame + 20;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const visibleRounds = Array.from({ length: rounds }).map((_, i) => i).filter(
    (i) => frame >= START_FRAME + i * ROUND_STAGGER - 1
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.chainLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chainLabel}
        </div>
      )}

      <div style={{ width: AREA_W, display: "flex", flexDirection: "column", gap: ROW_GAP / 2 }}>
        {visibleRounds.map((i) => {
          const count = Math.pow(2, i);
          const dotSize = Math.max(10, 32 - i * 5);
          const isLatest = i === visibleRounds[visibleRounds.length - 1];
          const popP = spring({ fps, frame: frame - (START_FRAME + i * ROUND_STAGGER), config: { damping: 14, stiffness: 150 } });
          const scale = isLatest ? interpolate(popP, [0, 1], [0, 1]) : 1;
          const fade = isLatest ? 1 : Math.max(0.35, 1 - (visibleRounds.length - 1 - visibleRounds.indexOf(i)) * 0.18);
          return (
            <div key={i} style={{ width: "100%", display: "flex", justifyContent: "center", gap: 6, opacity: fade }}>
              {Array.from({ length: count }).map((_, d) => (
                <div key={d} style={{
                  width: dotSize, height: dotSize, borderRadius: "50%",
                  background: isLatest ? accent : "var(--ink-75)",
                  transform: `scale(${scale})`,
                  boxShadow: isLatest ? `0 0 10px ${accent}80` : "none",
                }} />
              ))}
              <Sequence from={START_FRAME + i * ROUND_STAGGER} durationInFrames={4} layout="none">
                <Audio src={sfxTick()} volume={0.14} />
              </Sequence>
            </div>
          );
        })}
      </div>

      {scene.chainNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chainNote}
        </div>
      )}
    </div>
  );
};
