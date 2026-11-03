import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxLaser, sfxBeep } from "../utils/soundSynth";

const SFX_CYCLES = 5;

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CHIPS = [
  { x: 50, y: 50 },
  { x: 290, y: 60 },
  { x: 60, y: 290 },
  { x: 285, y: 280 },
];
const LOOP_FRAMES = 70;
const ELBOW = 36;

function chipPath(x: number, y: number) {
  const signX = CX > x ? 1 : -1;
  const signY = CY > y ? 1 : -1;
  const midX = CX - signX * ELBOW;
  const midY = CY - signY * ELBOW;
  return { d: `M ${x},${y} L ${midX},${y} L ${CX},${midY} L ${CX},${CY}`, midX, midY };
}

function pointAt(x: number, y: number, midX: number, midY: number, t: number) {
  const segs = [
    { x1: x, y1: y, x2: midX, y2: y },
    { x1: midX, y1: y, x2: CX, y2: midY },
    { x1: CX, y1: midY, x2: CX, y2: CY },
  ];
  const lens = segs.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= lens[i] || i === segs.length - 1) {
      const p = lens[i] ? d / lens[i] : 0;
      const s = segs[i];
      return { x: s.x1 + (s.x2 - s.x1) * p, y: s.y1 + (s.y2 - s.y1) * p };
    }
    d -= lens[i];
  }
  return { x: CX, y: CY };
}

// Trilhas com curvas de 45° levando pulsos de luz de chips periféricos até um
// processador central, que acende quando os pulsos chegam. Use pra TECNOLOGIA,
// processamento ou sistemas conectados — loop contínuo.
export const CircuitBoardScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  let glow = 0;
  const pulses = CHIPS.map((chip, i) => {
    const { d, midX, midY } = chipPath(chip.x, chip.y);
    const phase = (i / CHIPS.length) * LOOP_FRAMES;
    const t = ((frame + phase) % LOOP_FRAMES) / LOOP_FRAMES;
    const p = pointAt(chip.x, chip.y, midX, midY, t);
    const arrival = Math.max(0, 1 - Math.abs(t - 1) * 9);
    glow = Math.max(glow, arrival);
    return { d, x: p.x, y: p.y };
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.circuitLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.circuitLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {pulses.map((p, i) => (
          <path key={`path-${i}`} d={p.d} fill="none" stroke="var(--ink-18)" strokeWidth={3} />
        ))}
        {CHIPS.map((chip, i) => (
          <rect key={`chip-${i}`} x={chip.x - 16} y={chip.y - 16} width={32} height={32} rx={6}
                fill="var(--ink-08)" stroke="var(--ink-4)" strokeWidth={2} />
        ))}
        {pulses.map((p, i) => (
          <circle key={`pulse-${i}`} cx={p.x} cy={p.y} r={6} fill={accent}
                  style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
        ))}
        <rect x={CX - 46} y={CY - 46} width={92} height={92} rx={10}
              fill={`${accent}${Math.round(20 + glow * 60).toString(16).padStart(2, "0")}`}
              stroke={accent} strokeWidth={3}
              style={{ filter: `drop-shadow(0 0 ${10 + glow * 20}px ${accent})` }} />
        {scene.circuitCenterLabel && (
          <text x={CX} y={CY + 5} fill="var(--ink)" fontSize={16} fontWeight={800} textAnchor="middle">
            {scene.circuitCenterLabel}
          </text>
        )}
        {CHIPS.map((chip, i) => {
          const phase = (i / CHIPS.length) * LOOP_FRAMES;
          return Array.from({ length: SFX_CYCLES }).map((_, c) => {
            const departFrame = Math.round(c * LOOP_FRAMES - phase) + 1;
            const arriveFrame = Math.round((c + 1) * LOOP_FRAMES - phase) - 1;
            return (
              <React.Fragment key={`sfx-${i}-${c}`}>
                {departFrame >= 0 && (
                  <Sequence from={departFrame} durationInFrames={8} layout="none">
                    <Audio src={sfxLaser()} volume={0.1} />
                  </Sequence>
                )}
                {arriveFrame >= 0 && (
                  <Sequence from={arriveFrame} durationInFrames={6} layout="none">
                    <Audio src={sfxBeep(900 + i * 60, 0.08)} volume={0.14} />
                  </Sequence>
                )}
              </React.Fragment>
            );
          });
        })}
      </svg>

      {scene.circuitNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.circuitNote}
        </div>
      )}
    </div>
  );
};
