import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxBeep } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const TRIGGER_FRAME = 60;
const RETRACT_FRAME = TRIGGER_FRAME + 40;

// Relógio estilizado que bate na hora exata, dispara uma porta e um ícone salta em mola
// pra fora antes de recolher de volta. Use pra EVENTO PONTUAL que se repete (rotina,
// data marcada, compromisso recorrente).
export const CuckooPendulumScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [RETRACT_FRAME + 20, RETRACT_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shakeEnv = interpolate(frame, [TRIGGER_FRAME, TRIGGER_FRAME + 5, TRIGGER_FRAME + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeRot = Math.sin(frame * 5) * 3 * shakeEnv;

  const doorAngle = interpolate(
    frame,
    [TRIGGER_FRAME, TRIGGER_FRAME + 8, RETRACT_FRAME, RETRACT_FRAME + 10],
    [0, -75, -75, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const popSpring = spring({ fps, frame: Math.max(frame - (TRIGGER_FRAME + 6), 0), config: { damping: 9, stiffness: 140 } });
  const retract = interpolate(frame, [RETRACT_FRAME, RETRACT_FRAME + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const popY = interpolate(popSpring, [0, 1], [40, -40]) + retract * 80;
  const popOp = interpolate(frame, [TRIGGER_FRAME + 6, TRIGGER_FRAME + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - interpolate(retract, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={TRIGGER_FRAME} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.12} />
      </Sequence>
      <Sequence from={TRIGGER_FRAME + 6} durationInFrames={6} layout="none">
        <Audio src={sfxBeep()} volume={0.18} />
      </Sequence>
      <Sequence from={TRIGGER_FRAME + 16} durationInFrames={6} layout="none">
        <Audio src={sfxBeep()} volume={0.18} />
      </Sequence>
      {scene.cuckooLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cuckooLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        <g transform={`rotate(${shakeRot}, 160, 180)`}>
          <rect x={100} y={70} width={120} height={26} rx={4} fill="#2b2b33"
                transform={`rotate(${doorAngle}, 160, 96)`} />
          <circle cx={160} cy={180} r={85} fill="#1c1c22" stroke="var(--ink-25)" strokeWidth={6} />
          <circle cx={160} cy={180} r={3} fill={accent} />
          <line x1={160} y1={180} x2={160} y2={130} stroke="var(--ink)" strokeWidth={4} />
          <line x1={160} y1={180} x2={195} y2={180} stroke="var(--ink)" strokeWidth={4} />
          {scene.cuckooTime && (
            <text x={160} y={240} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--ink)">
              {scene.cuckooTime}
            </text>
          )}
        </g>

        {scene.cuckooRevealLabel && (
          <text x={160} y={96 + popY} textAnchor="middle" fontSize={26} fontWeight={900} fill={accent}
                opacity={popOp} style={{ filter: `drop-shadow(0 0 10px ${accent}90)` }}>
            {scene.cuckooRevealLabel}
          </text>
        )}
      </svg>

      {scene.cuckooNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cuckooNote}
        </div>
      )}
    </div>
  );
};
