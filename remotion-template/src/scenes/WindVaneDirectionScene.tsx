import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

const SIZE = 320;
const CENTER = SIZE / 2;
const LINES = Array.from({ length: 6 }).map((_, i) => ({ y: 30 + i * 45, speed: 2.2 + (i % 3) * 0.6, phase: i * 37 }));

// Linhas de vento varrendo a tela enquanto um cata-vento central gira e se estabiliza
// apontando contra a corrente, com medição de velocidade. Use pra RESISTÊNCIA a uma força
// externa (mercado, crise) que se estabiliza numa direção.
export const WindVaneDirectionScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spin = frame < 40 ? frame * 18 : 40 * 18;
  const settle = spring({ frame: frame - 40, fps, config: { damping: 12, mass: 0.7 } });
  const vaneAngle = frame < 40 ? spin : 40 * 18 + settle * (180 - ((40 * 18) % 360));

  const speedOp = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [62, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.windvaneLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.windvaneLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {LINES.map((l, i) => {
          const x = ((SIZE + 60 - ((frame * l.speed + l.phase) % (SIZE + 120))) - 60);
          return (
            <line key={i} x1={x} y1={l.y} x2={x + 36} y2={l.y} stroke="#9ab" strokeWidth={3}
                  strokeDasharray="10 6" opacity={0.5} />
          );
        })}
        {LINES.map((l, i) => {
          const period = (SIZE + 120) / l.speed;
          const frame0 = (((SIZE / 2 - l.phase) % (SIZE + 120)) + (SIZE + 120)) % (SIZE + 120) / l.speed;
          return Array.from({ length: 4 }).map((_, c) => (
            <Sequence key={`sfx-${i}-${c}`} from={Math.round(frame0 + c * period)} durationInFrames={10} layout="none">
              <Audio src={sfxWhoosh(0.2)} volume={0.09} />
            </Sequence>
          ));
        })}

        <g transform={`translate(${CENTER} ${CENTER}) rotate(${vaneAngle})`}>
          <line x1={-70} y1={0} x2={70} y2={0} stroke={accent} strokeWidth={5}
                style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
          <polygon points="70,0 50,-14 50,14" fill={accent} />
          <polygon points="-70,0 -50,-14 -50,14" fill="#555" />
          <circle cx={0} cy={0} r={8} fill="var(--ink)" />
        </g>
      </svg>

      {scene.windvaneSpeed && (
        <div style={{ opacity: speedOp, fontSize: 44, fontWeight: 800, color: "var(--ink)",
                      textAlign: "center", textShadow: SOFT_TEXT_SHADOW }}>
          {scene.windvaneSpeed}
        </div>
      )}

      {scene.windvaneNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.windvaneNote}
        </div>
      )}
    </div>
  );
};
