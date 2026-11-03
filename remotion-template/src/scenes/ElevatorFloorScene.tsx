import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxBeep } from "../utils/soundSynth";

const STEP_FRAMES = 8;
const MAX_FLOORS = 40;

// Painel indicador de andares subindo com seta luminosa, enquanto linhas de fundo passam
// rápido pra baixo dando sensação de subida vertical, sem foto de fundo. Use pra
// PROGRESSÃO DE NÍVEL ou ascensão (carreira, patrimônio subindo de faixa).
export const ElevatorFloorScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const target = scene.elevatorFloor || "10";
  const parsed = parseInt(target, 10);

  const steps: string[] = ["T"];
  if (!Number.isNaN(parsed) && parsed > 0) {
    const n = Math.min(parsed, MAX_FLOORS);
    for (let i = 1; i <= n; i++) steps.push(String(i));
    if (n < parsed) steps[steps.length - 1] = target; // alvo muito alto: mostra direto o rótulo final
  } else {
    steps.push(target);
  }

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrivalFrame = (steps.length - 1) * STEP_FRAMES;
  const currentIndex = Math.min(Math.floor(frame / STEP_FRAMES), steps.length - 1);
  const noteOp = interpolate(frame, [arrivalFrame + 14, arrivalFrame + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const effectiveFrame = Math.min(frame, arrivalFrame);
  const spacing = 36;
  const lineOffset = (effectiveFrame * 10) % spacing;
  const arrowPulse = frame < arrivalFrame ? 0.7 + 0.3 * Math.abs(Math.sin(frame * 0.3)) : 1;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.elevatorLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.elevatorLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        <clipPath id="elevatorClip">
          <rect x={0} y={0} width={320} height={320} />
        </clipPath>
        <g clipPath="url(#elevatorClip)" opacity={0.35}>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={0} y1={i * spacing - lineOffset} x2={320} y2={i * spacing - lineOffset}
                  stroke="var(--ink)" strokeWidth={1.5} />
          ))}
        </g>

        <rect x={80} y={120} width={120} height={80} rx={8} fill="#1c1c22" stroke="var(--ink-25)" strokeWidth={3} />
        <text x={140} y={172} textAnchor="middle" fontSize={44} fontWeight={900} fill={accent}
              style={{ filter: `drop-shadow(0 0 10px ${accent}90)` }}>
          {steps[currentIndex]}
        </text>

        <polygon points="230,180 250,140 270,180" fill={accent} opacity={arrowPulse}
                 style={{ filter: `drop-shadow(0 0 8px ${accent}90)` }} />
      </svg>

      {scene.elevatorNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.elevatorNote}
        </div>
      )}

      {Array.from({ length: steps.length - 1 }).map((_, i) => (
        <Sequence key={i} from={(i + 1) * STEP_FRAMES} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.13} />
        </Sequence>
      ))}
      <Sequence from={arrivalFrame} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1100)} volume={0.18} />
      </Sequence>
    </div>
  );
};
