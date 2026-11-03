import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxResonance } from "../utils/soundSynth";

const BAR_COUNT = 12;
const BAR_W = 14;
const GAP = 10;
const MAX_H = 180;
const TRANSITION_FRAME = 40;

// Equalizador de barras (estilo medidor de áudio) que reage a um estímulo sonoro:
// "loud" dispara a amplitude, "highpitch" dispara a frequência de oscilação — use pra
// ilustrar um som alto/agudo específico, diferente de cenas de dados numéricos puros.
export const SoundWaveScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const mode = scene.soundMode ?? "loud";
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shockT = interpolate(frame, [TRANSITION_FRAME, TRANSITION_FRAME + 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ampMult = mode === "loud" ? interpolate(shockT, [0, 1], [1, 2.6]) : 1;
  const freqMult = mode === "highpitch" ? interpolate(shockT, [0, 1], [1, 3.4]) : 1;

  const totalW = BAR_COUNT * BAR_W + (BAR_COUNT - 1) * GAP;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.soundLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.soundLabel}
        </div>
      )}

      <div style={{ opacity: bodyOp, width: totalW, height: MAX_H, display: "flex", alignItems: "center", gap: GAP }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const phase = i * 0.7;
          const baseFreq = 0.12 + (i % 4) * 0.015;
          const osc = Math.sin(frame * baseFreq * freqMult + phase);
          const h = Math.max(10, (0.35 + 0.3 * (osc + 1)) * MAX_H * ampMult * 0.5);
          const clampedH = Math.min(MAX_H, h);
          return (
            <div key={i} style={{
              width: BAR_W, height: clampedH, background: accent, borderRadius: 6,
              boxShadow: `0 0 10px ${accent}80`,
            }} />
          );
        })}
      </div>

      {scene.soundNote && (
        <div style={{ opacity: interpolate(frame, [TRANSITION_FRAME + 16, TRANSITION_FRAME + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.soundNote}
        </div>
      )}

      <Sequence from={TRANSITION_FRAME} durationInFrames={23} layout="none">
        <Audio src={sfxResonance()} volume={0.15} />
      </Sequence>
    </div>
  );
};
