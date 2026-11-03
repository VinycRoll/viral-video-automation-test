import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxResonance } from "../utils/soundSynth";

const W = 560;
const H = 260;
const CENTER_R = 36;
const REVEAL_FRAME = 70;

// Ilusão de Ebbinghaus: dois círculos centrais idênticos, um cercado por círculos
// pequenos (parece maior) e outro por círculos grandes (parece menor). Depois de um
// tempo estático, os dois deslizam ao centro e se sobrepõem pra provar que são iguais.
export const OpticalIllusionScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const slideT = interpolate(frame, [REVEAL_FRAME, REVEAL_FRAME + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contextOp = interpolate(frame, [REVEAL_FRAME, REVEAL_FRAME + 20], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const leftCx = W / 2 - 150 + slideT * 150;
  const rightCx = W / 2 + 150 - slideT * 150;
  const cy = H / 2;

  const smallSurround = Array.from({ length: 8 }).map((_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const r = CENTER_R + 24;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, radius: 10 };
  });
  const bigSurround = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2;
    const r = CENTER_R + 60;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, radius: 34 };
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={REVEAL_FRAME} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(260, 0.7)} volume={0.14} />
      </Sequence>
      {scene.illusionLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.illusionLabel}
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: bodyOp }}>
        <g transform={`translate(${leftCx}, ${cy})`} opacity={contextOp}>
          {smallSurround.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.radius} fill="none" stroke="var(--ink-4)" strokeWidth={2} />
          ))}
        </g>
        <g transform={`translate(${rightCx}, ${cy})`} opacity={contextOp}>
          {bigSurround.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.radius} fill="none" stroke="var(--ink-4)" strokeWidth={2} />
          ))}
        </g>
        <circle cx={leftCx} cy={cy} r={CENTER_R} fill={accent} opacity={0.85} />
        <circle cx={rightCx} cy={cy} r={CENTER_R} fill="var(--ink-85)" />
        {slideT > 0.95 && (
          <circle cx={(leftCx + rightCx) / 2} cy={cy} r={CENTER_R + 6} fill="none"
                  stroke={accent} strokeWidth={3} opacity={interpolate(slideT, [0.95, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        )}
      </svg>

      {scene.illusionNote && (
        <div style={{ opacity: interpolate(frame, [REVEAL_FRAME + 20, REVEAL_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.illusionNote}
        </div>
      )}
    </div>
  );
};
