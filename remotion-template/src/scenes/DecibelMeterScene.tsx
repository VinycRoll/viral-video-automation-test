import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBeep } from "../utils/soundSynth";

const NUM_BLOCKS = 11;
const BLOCK_H = 20;
const GAP = 5;
const BASE_Y = 300;
const BAR_X = 140;
const BAR_W = 90;
const FILL_FRAMES = 50;

function colorFor(i: number): string {
  const ratio = i / NUM_BLOCKS;
  if (ratio < 0.5) return "#3ecf6b";
  if (ratio < 0.8) return "#e8d23f";
  return "#e2483f";
}

// Barra vertical segmentada (verde/amarelo/vermelho) acendendo de baixo pra cima com um
// pico marcado travado no topo, sem foto de fundo. Use pra INTENSIDADE crescente de som,
// risco ou impacto.
export const DecibelMeterScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const pct = Math.max(0, Math.min(100, scene.decibelPct ?? 70));
  const targetLit = Math.round((pct / 100) * NUM_BLOCKS);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [FILL_FRAMES + 14, FILL_FRAMES + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const peakY = BASE_Y - targetLit * (BLOCK_H + GAP);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.decibelLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.decibelLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        {Array.from({ length: NUM_BLOCKS }).map((_, i) => {
          const y = BASE_Y - (i + 1) * (BLOCK_H + GAP);
          const litFrame = targetLit > 0 ? (i / targetLit) * FILL_FRAMES : Infinity;
          const op = i < targetLit
            ? interpolate(frame, [litFrame, litFrame + 5], [0.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0.15;
          return (
            <React.Fragment key={i}>
              <rect x={BAR_X} y={y} width={BAR_W} height={BLOCK_H} rx={3} fill={colorFor(i)} opacity={op} />
              {i < targetLit && Number.isFinite(litFrame) && (
                <Sequence from={Math.round(litFrame)} durationInFrames={6} layout="none">
                  <Audio src={sfxBeep(500 + (i / NUM_BLOCKS) * 900, 0.08)} volume={0.12} />
                </Sequence>
              )}
            </React.Fragment>
          );
        })}

        {targetLit > 0 && (
          <rect x={BAR_X - 10} y={peakY - 2} width={BAR_W + 20} height={3} fill={accent}
                style={{ filter: `drop-shadow(0 0 8px ${accent}90)` }} />
        )}
      </svg>

      {scene.decibelNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.decibelNote}
        </div>
      )}
    </div>
  );
};
