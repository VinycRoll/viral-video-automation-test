import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxImpact } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const CX = 160;
const CY = 160;
const R = 140;
const STEP_FRAMES = 45;
const SPINS = 2; // voltas extras de drama por etapa

// Disco numerado de cofre girando esquerda/direita/esquerda até destravar uma tranca
// pesada no centro, sem foto de fundo. Use pra SEGREDO, código de acesso ou algo que
// exige a combinação certa.
export const DialSafeCombinationScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const combo = scene.safeCombo && scene.safeCombo.length ? scene.safeCombo : [42, 15, 88];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // pré-calcula a rotação final de cada etapa, alternando sentido (esquerda/direita/esquerda...)
  const targets: number[] = [];
  let prev = 0;
  combo.forEach((n, i) => {
    const sign = i % 2 === 0 ? -1 : 1;
    const wanted = -(n * 3.6);
    let delta = ((wanted - prev) % 360 + 360) % 360; // 0..360, sempre positivo
    if (sign < 0) delta -= 360; // vira negativo pra girar pra esquerda
    targets.push(prev + sign * SPINS * 360 + delta);
    prev = targets[i];
  });

  let rotation = 0;
  let base = 0;
  combo.forEach((_, i) => {
    const stepStart = i * STEP_FRAMES;
    const localFrame = Math.max(frame - stepStart, 0);
    const p = spring({ fps, frame: localFrame, config: { damping: 13, stiffness: 85 } });
    rotation = base + p * (targets[i] - base);
    base = targets[i];
  });

  const lastStepEnd = combo.length * STEP_FRAMES;
  const unlockOp = interpolate(frame, [lastStepEnd, lastStepEnd + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [lastStepEnd + 20, lastStepEnd + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {combo.map((_, i) => (
        <Sequence key={i} from={i * STEP_FRAMES} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={lastStepEnd} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      {scene.safeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.safeLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        <polygon points={`${CX - 8},${CY - R - 14} ${CX + 8},${CY - R - 14} ${CX},${CY - R + 4}`} fill={accent} />

        <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>
          <circle cx={CX} cy={CY} r={R} fill="#1c1c22" stroke="var(--ink-2)" strokeWidth={4} />
          {Array.from({ length: 20 }).map((_, i) => {
            const n = i * 5;
            const ang = ((n * 3.6 - 90) * Math.PI) / 180;
            const x1 = CX + (R - 6) * Math.cos(ang);
            const y1 = CY + (R - 6) * Math.sin(ang);
            const x2 = CX + (R - 20) * Math.cos(ang);
            const y2 = CY + (R - 20) * Math.sin(ang);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-5)" strokeWidth={2} />;
          })}
        </g>

        <rect x={CX - 26} y={CY - 26} width={52} height={52} rx={8}
              fill={unlockOp > 0.5 ? accent : "#2b2b33"} stroke="var(--ink-3)" strokeWidth={3}
              opacity={1} style={{ filter: unlockOp > 0.5 ? `drop-shadow(0 0 18px ${accent}90)` : "none" }} />
      </svg>

      {scene.safeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.safeNote}
        </div>
      )}
    </div>
  );
};
