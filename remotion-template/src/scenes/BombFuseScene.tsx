import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxExplosion } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const WAYPOINTS = [
  { x: 30, y: 40 },
  { x: 150, y: 90 },
  { x: 60, y: 170 },
  { x: 200, y: 220 },
  { x: 150, y: 290 },
];
const TRAVEL_FRAMES = 90;

function pointAtFraction(p: number) {
  const lens: number[] = [];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    lens.push(Math.hypot(WAYPOINTS[i + 1].x - WAYPOINTS[i].x, WAYPOINTS[i + 1].y - WAYPOINTS[i].y));
  }
  const total = lens.reduce((a, b) => a + b, 0);
  let d = p * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = lens[i] ? d / lens[i] : 0;
      const a = WAYPOINTS[i];
      const b = WAYPOINTS[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    d -= lens[i];
  }
  return WAYPOINTS[WAYPOINTS.length - 1];
}

// Pavio sinuoso com faísca percorrendo o caminho (consumindo-o atrás de si) até chegar
// no ícone final e gerar ondas de choque. Use pra CONTAGEM REGRESSIVA, tensão crescente
// ou algo que vai "explodir" (uma decisão, uma crise, um prazo).
export const BombFuseScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const end = WAYPOINTS[WAYPOINTS.length - 1];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = interpolate(frame, [0, TRAVEL_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spark = pointAtFraction(p);
  const pathD = `M ${WAYPOINTS.map((w) => `${w.x},${w.y}`).join(" L ")}`;
  const noteOp = interpolate(frame, [TRAVEL_FRAMES + 40, TRAVEL_FRAMES + 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const waves = [0, 6, 12].map((delay) => {
    const start = TRAVEL_FRAMES + delay;
    const r = interpolate(frame, [start, start + 24], [0, 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const op = interpolate(frame, [start, start + 24], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { r, op };
  });

  const impactScale = interpolate(frame, [TRAVEL_FRAMES, TRAVEL_FRAMES + 6, TRAVEL_FRAMES + 16], [1, 1.5, 1.1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {[0, 15, 30, 45, 60, 75].map((t) => (
        <Sequence key={t} from={t} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={TRAVEL_FRAMES} durationInFrames={20} layout="none">
        <Audio src={sfxExplosion()} volume={0.2} />
      </Sequence>
      {scene.fuseLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.fuseLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <path d={pathD} fill="none" stroke="#d8c9a8" strokeWidth={6} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="#3a3a3a" strokeWidth={6} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />

        {p < 1 && (
          <circle cx={spark.x} cy={spark.y} r={9} fill={accent}
                  style={{ filter: `drop-shadow(0 0 16px ${accent})` }} />
        )}

        {waves.map((w, i) => (
          <circle key={i} cx={end.x} cy={end.y} r={w.r} fill="none" stroke={accent} strokeWidth={3} opacity={w.op} />
        ))}

        <circle cx={end.x} cy={end.y} r={22 * (p >= 1 ? impactScale : 1)} fill="var(--ink-08)"
                stroke={accent} strokeWidth={3} />
        {scene.fuseTitle && (
          <text x={end.x} y={end.y + 42} fill="var(--ink)" fontSize={18} fontWeight={800} textAnchor="middle">
            {scene.fuseTitle}
          </text>
        )}
      </svg>

      {scene.fuseNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.fuseNote}
        </div>
      )}
    </div>
  );
};
