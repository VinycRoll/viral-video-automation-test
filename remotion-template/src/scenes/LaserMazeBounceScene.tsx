import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxLaser } from "../utils/soundSynth";

const SIZE = 320;
const WAYPOINTS = [
  { x: 20, y: 30 },
  { x: 280, y: 90 },
  { x: 50, y: 170 },
  { x: 260, y: 250 },
];
const TRAVEL_FRAMES = 70;

function pathLength() {
  let total = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    total += Math.hypot(WAYPOINTS[i + 1].x - WAYPOINTS[i].x, WAYPOINTS[i + 1].y - WAYPOINTS[i].y);
  }
  return total;
}

// Feixe de luz reto que reflete em 3-4 espelhos angulados até atingir um alvo no lado
// oposto. Use pra CAMINHO INDIRETO até um objetivo (estratégia com desvios).
export const LaserMazeBounceScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const total = pathLength();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const progress = interpolate(frame, [10, TRAVEL_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathD = `M ${WAYPOINTS.map((w) => `${w.x},${w.y}`).join(" L ")}`;
  const hit = frame >= TRAVEL_FRAMES;
  const targetPulse = hit ? 1 + 0.3 * Math.sin((frame - TRAVEL_FRAMES) / 4) : 1;
  const noteOp = interpolate(frame, [TRAVEL_FRAMES + 14, TRAVEL_FRAMES + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // frames onde o feixe passa por cada espelho interno, derivados da mesma distância
  // acumulada que já dirige `progress` (mesmo mapeamento [10, TRAVEL_FRAMES] -> [0,1]).
  const reflectionFrames: number[] = [];
  {
    let cum = 0;
    for (let i = 1; i < WAYPOINTS.length - 1; i++) {
      cum += Math.hypot(WAYPOINTS[i].x - WAYPOINTS[i - 1].x, WAYPOINTS[i].y - WAYPOINTS[i - 1].y);
      reflectionFrames.push(Math.round(10 + (cum / total) * (TRAVEL_FRAMES - 10)));
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {reflectionFrames.map((rf, i) => (
        <Sequence key={i} from={rf} durationInFrames={8} layout="none">
          <Audio src={sfxLaser()} volume={0.16} />
        </Sequence>
      ))}

      {scene.laserLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.laserLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {WAYPOINTS.slice(1, -1).map((w, i) => (
          <rect key={i} x={w.x - 16} y={w.y - 4} width={32} height={8} fill="#aab" opacity={0.8}
                transform={`rotate(${i % 2 === 0 ? 35 : -35} ${w.x} ${w.y})`} />
        ))}

        <path d={pathD} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress}
              style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />

        <circle cx={WAYPOINTS[WAYPOINTS.length - 1].x} cy={WAYPOINTS[WAYPOINTS.length - 1].y}
                r={16 * targetPulse} fill="none" stroke={hit ? accent : "#888"} strokeWidth={4}
                opacity={hit ? 1 : 0.5} />
        {scene.laserTargetLabel && (
          <text x={WAYPOINTS[WAYPOINTS.length - 1].x} y={WAYPOINTS[WAYPOINTS.length - 1].y + 36}
                fill="var(--ink)" fontSize={16} fontWeight={800} textAnchor="middle">
            {scene.laserTargetLabel}
          </text>
        )}
      </svg>

      {scene.laserNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.laserNote}
        </div>
      )}
    </div>
  );
};
