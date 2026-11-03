import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxImpact, sfxResonance } from "../utils/soundSynth";

const SIZE = 320;
const LEFT_X = 100;
const RIGHT_X = 220;
const FORK_Y = 90;
const PRONG_LEN = 90;
const STRIKE_FRAME = 8;
const WAVE_ARRIVE = 55;

function vibration(frame: number, startFrame: number) {
  const since = frame - startFrame;
  if (since < 0) return 0;
  const decay = interpolate(since, [0, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.sin(since * 1.4) * 6 * decay;
}

// Dois diapasões em "U" lado a lado; o da esquerda vibra e faz o da direita vibrar por
// simpatia, sem contato. Use pra CONTÁGIO/INFLUÊNCIA invisível (ideias, hábitos, confiança).
export const TuningForkResonanceScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftVib = vibration(frame, STRIKE_FRAME);
  const rightVib = vibration(frame, WAVE_ARRIVE);

  const waveOp = interpolate(frame, [STRIKE_FRAME, STRIKE_FRAME + 10, WAVE_ARRIVE], [0, 0.6, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const waveX = interpolate(frame, [STRIKE_FRAME, WAVE_ARRIVE], [LEFT_X + 20, RIGHT_X - 20], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const noteOp = interpolate(frame, [WAVE_ARRIVE + 50, WAVE_ARRIVE + 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fork = (x: number, vib: number) => (
    <g>
      <line x1={x - 16 + vib} y1={FORK_Y} x2={x - 16 + vib} y2={FORK_Y + PRONG_LEN} stroke="#ccc" strokeWidth={6} />
      <line x1={x + 16 - vib} y1={FORK_Y} x2={x + 16 - vib} y2={FORK_Y + PRONG_LEN} stroke="#ccc" strokeWidth={6} />
      <path d={`M ${x - 16} ${FORK_Y + PRONG_LEN} Q ${x} ${FORK_Y + PRONG_LEN + 20} ${x + 16} ${FORK_Y + PRONG_LEN}`}
            fill="none" stroke="#ccc" strokeWidth={6} />
      <line x1={x} y1={FORK_Y + PRONG_LEN + 10} x2={x} y2={FORK_Y + PRONG_LEN + 40} stroke="#999" strokeWidth={5} />
    </g>
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.tuningforkLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.tuningforkLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {fork(LEFT_X, leftVib)}
        {fork(RIGHT_X, rightVib)}
        {waveOp > 0 && (
          <>
            <path d={`M ${waveX - 10} ${FORK_Y + 30} Q ${waveX} ${FORK_Y + 15} ${waveX - 10} ${FORK_Y}`}
                  fill="none" stroke={accent} strokeWidth={2} opacity={waveOp} />
            <path d={`M ${waveX + 10} ${FORK_Y + 50} Q ${waveX + 20} ${FORK_Y + 35} ${waveX + 10} ${FORK_Y + 20}`}
                  fill="none" stroke={accent} strokeWidth={2} opacity={waveOp} />
          </>
        )}
      </svg>

      {scene.tuningforkNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.tuningforkNote}
        </div>
      )}

      <Sequence from={STRIKE_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.19} />
      </Sequence>
      <Sequence from={STRIKE_FRAME} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(440)} volume={0.15} />
      </Sequence>
      <Sequence from={WAVE_ARRIVE} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(440)} volume={0.13} />
      </Sequence>
    </div>
  );
};
