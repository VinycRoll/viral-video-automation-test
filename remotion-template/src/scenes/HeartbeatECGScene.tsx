import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBeep } from "../utils/soundSynth";

const W = 640;
const H = 160;
const TRANSITION_FRAME = 45;
// um ciclo de batimento = pontos (x em "unidades de tempo", y em amplitude -1..1)
const BEAT = [0, 0, 0.15, -0.1, 0, 0.9, -0.5, 0, 0.1, 0.05, 0];
const BEAT_W = 26;

// Linha de monitor cardíaco (ECG) que começa num ritmo calmo e, numa marca fixa,
// reage ao conteúdo: acelera e fica vermelha ("spike") ou vira uma reta ("flatline").
// Use pra sustos/clímax de saúde (infarto, pânico, risco).
export const HeartbeatECGScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const mode = scene.ecgMode ?? "spike";
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dangerT = interpolate(frame, [TRANSITION_FRAME, TRANSITION_FRAME + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const freqMult = mode === "flatline" ? 1 : interpolate(dangerT, [0, 1], [1, 2.2]);
  const ampMult = mode === "flatline" ? interpolate(dangerT, [0, 1], [1, 0.03]) : 1;
  const color = `rgb(${interpolate(dangerT, [0, 1], [120, 230])},${interpolate(dangerT, [0, 1], [230, 50])},${interpolate(dangerT, [0, 1], [150, 50])})`;

  const samplesPerBeat = BEAT.length;
  const totalSamples = 120;
  const points: string[] = [];
  for (let i = 0; i < totalSamples; i++) {
    const x = (i / totalSamples) * W;
    const t = frame * 0.6 * freqMult + i * 0.9;
    const beatIdx = Math.floor(t) % samplesPerBeat;
    const nextIdx = (beatIdx + 1) % samplesPerBeat;
    const frac = t - Math.floor(t);
    const v = BEAT[beatIdx] + (BEAT[nextIdx] - BEAT[beatIdx]) * frac;
    const y = H / 2 - v * (H / 2.3) * ampMult;
    points.push(`${x},${y}`);
  }

  // mesma fórmula de dangerT/freqMult que dirige a onda visual, usada aqui só pra achar
  // em que frame cada pico (beatIdx === 5) cruza — pra cravar o beep no pico real.
  const peakFrames: number[] = [];
  let prevBeat = -1;
  for (let f = 0; f <= 400; f++) {
    const dT = interpolate(f, [TRANSITION_FRAME, TRANSITION_FRAME + 30], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const fm = mode === "flatline" ? 1 : interpolate(dT, [0, 1], [1, 2.2]);
    const beat = Math.floor(f * 0.6 * fm);
    if (beat !== prevBeat && beat % samplesPerBeat === 5) peakFrames.push(f);
    prevBeat = beat;
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.ecgLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.ecgLabel}
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: bodyOp }}>
        <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
                   style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>

      {peakFrames.map((pf) => (
        <Sequence key={pf} from={pf} durationInFrames={6} layout="none">
          <Audio src={sfxBeep(880, 0.1)} volume={0.16} />
        </Sequence>
      ))}

      {scene.ecgNote && (
        <div style={{ opacity: interpolate(frame, [TRANSITION_FRAME + 20, TRANSITION_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.ecgNote}
        </div>
      )}
    </div>
  );
};
