import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact, sfxBeep } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const BUMPERS = [
  { x: 110, y: 110 },
  { x: 210, y: 150 },
  { x: 130, y: 210 },
];
const HIT_FRAMES = [18, 40, 62];
const BALL_WAYPOINTS = [{ x: 160, y: 10 }, ...BUMPERS, { x: 280, y: 280 }];

function pointAtFraction(p: number) {
  const lens: number[] = [];
  for (let i = 0; i < BALL_WAYPOINTS.length - 1; i++) {
    lens.push(Math.hypot(BALL_WAYPOINTS[i + 1].x - BALL_WAYPOINTS[i].x, BALL_WAYPOINTS[i + 1].y - BALL_WAYPOINTS[i].y));
  }
  const total = lens.reduce((a, b) => a + b, 0);
  let d = p * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = lens[i] ? d / lens[i] : 0;
      const a = BALL_WAYPOINTS[i];
      const b = BALL_WAYPOINTS[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    d -= lens[i];
  }
  return BALL_WAYPOINTS[BALL_WAYPOINTS.length - 1];
}

// Bola cai entre três bumpers que piscam e crescem a cada colisão, somando pontos
// rapidamente. Use pra ACÚMULO RÁPIDO E CAÓTICO de pontos/ganhos em sequência.
export const PinballBumperScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = interpolate(frame, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ball = pointAtFraction(p);

  const finalScore = parseInt((scene.pinballScore || "0").replace(/\D/g, ""), 10) || 0;
  const scoreStep = Math.ceil(finalScore / HIT_FRAMES.length);
  let displayScore = 0;
  HIT_FRAMES.forEach((hf, i) => {
    if (frame >= hf) displayScore = Math.min(finalScore, scoreStep * (i + 1));
  });

  const noteOp = interpolate(frame, [86, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {HIT_FRAMES.map((hf, i) => (
        <Sequence key={`impact-${i}`} from={hf} durationInFrames={13} layout="none">
          <Audio src={sfxImpact()} volume={0.18} />
        </Sequence>
      ))}
      {HIT_FRAMES.map((hf, i) => (
        <Sequence key={`beep-${i}`} from={hf} durationInFrames={6} layout="none">
          <Audio src={sfxBeep(1600)} volume={0.14} />
        </Sequence>
      ))}
      {scene.pinballLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pinballLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {BUMPERS.map((b, i) => {
          const hitFrame = HIT_FRAMES[i];
          const flash = interpolate(frame, [hitFrame, hitFrame + 6, hitFrame + 16], [1, 1.5, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const active = frame >= hitFrame;
          return (
            <circle key={i} cx={b.x} cy={b.y} r={26 * flash} fill={active ? accent : "#555"}
                    opacity={0.85} style={{ filter: active ? `drop-shadow(0 0 14px ${accent})` : undefined }} />
          );
        })}
        {p < 1 && <circle cx={ball.x} cy={ball.y} r={8} fill="var(--ink)" />}
      </svg>

      {scene.pinballScore && (
        <div style={{ fontSize: 48, fontWeight: 800, color: "var(--ink)", textAlign: "center", textShadow: SOFT_TEXT_SHADOW }}>
          {displayScore.toLocaleString("pt-BR")}
        </div>
      )}

      {scene.pinballNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pinballNote}
        </div>
      )}
    </div>
  );
};
