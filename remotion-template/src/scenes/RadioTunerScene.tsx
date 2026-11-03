import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxStatic, sfxBeep } from "../utils/soundSynth";

const DIAL_W = 320;
const PAD = 20;
const FROM = 88;
const TO = 108;
const SETTLE_FRAME = 70;

// Mostrador de frequências estilo dial de rádio FM, com ponteiro vermelho que desliza
// com ruído/tremor até sintonizar um ponto exato e limpo. Use pra ENCONTRAR o ponto
// certo (sintonia, precisão, acerto depois de tentativa e erro).
export const RadioTunerScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const freqVal = Math.max(FROM, Math.min(TO, parseFloat(scene.radioFreq || "") || 97.5));

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moveP = interpolate(frame, [0, SETTLE_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetX = interpolate(freqVal, [FROM, TO], [PAD, DIAL_W - PAD]);
  const startX = PAD + (DIAL_W - PAD * 2) * 0.1;
  const baseX = interpolate(moveP, [0, 1], [startX, targetX]);
  const jitterAmp = 9 * (1 - moveP);
  const pointerX = baseX + jitterAmp * Math.sin(frame * 1.4) + jitterAmp * 0.4 * Math.sin(frame * 2.7 + 1);

  const glowOp = interpolate(frame, [SETTLE_FRAME, SETTLE_FRAME + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [SETTLE_FRAME + 12, SETTLE_FRAME + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ticks: number[] = [];
  for (let v = FROM; v <= TO; v += 2) ticks.push(v);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.radioLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.radioLabel}
        </div>
      )}

      <svg width={DIAL_W} height={140} viewBox={`0 0 ${DIAL_W} 140`}>
        <rect x={0} y={60} width={DIAL_W} height={6} rx={3} fill="var(--ink-18)" />
        {ticks.map((v) => {
          const x = interpolate(v, [FROM, TO], [PAD, DIAL_W - PAD]);
          const major = v % 4 === 0;
          return (
            <g key={v}>
              <line x1={x} y1={major ? 42 : 50} x2={x} y2={70} stroke="var(--ink-4)" strokeWidth={major ? 2.5 : 1.5} />
              {major && (
                <text x={x} y={32} fill="var(--ink-65)" fontSize={14} fontWeight={700} textAnchor="middle">{v}</text>
              )}
            </g>
          );
        })}
        <line x1={pointerX} y1={20} x2={pointerX} y2={100} stroke="#ff3b3b" strokeWidth={4}
              style={{ filter: glowOp > 0 ? `drop-shadow(0 0 ${14 * glowOp}px ${accent})` : "none" }} />
      </svg>

      {scene.radioFreq && (
        <div style={{ fontSize: 40, fontWeight: 900, color: glowOp > 0.5 ? accent : "var(--ink)",
                      fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
          {scene.radioFreq}
        </div>
      )}

      {scene.radioNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.radioNote}
        </div>
      )}

      {[0, 8, 16, 24, 32, 40, 48, 56, 64].map((f) => (
        <Sequence key={f} from={f} durationInFrames={8} layout="none">
          <Audio src={sfxStatic()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={SETTLE_FRAME} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1000)} volume={0.17} />
      </Sequence>
    </div>
  );
};
