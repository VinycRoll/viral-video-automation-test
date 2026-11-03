import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBubble, sfxBeep } from "../utils/soundSynth";

const W = 220;
const H = 360;
const BORDER = 6;
const FILL_FRAMES = 85;

// Recipiente transparente sendo preenchido de baixo pra cima com ondas suaves na
// superfície até estabilizar em liquidPct%. Use pra ACÚMULO gradual de algo
// líquido/fluido (reserva, cota, capacidade) — a onda nunca para de oscilar.
export const LiquidFillScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const pct = Math.max(0, Math.min(100, scene.liquidPct ?? 60));

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fillP = interpolate(frame, [0, FILL_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fillTopY = H - fillP * pct * (H / 100);
  const noteOp = interpolate(frame, [FILL_FRAMES + 10, FILL_FRAMES + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const points: string[] = [];
  const STEP = 10;
  for (let x = -STEP; x <= W + STEP; x += STEP) {
    const wave = Math.sin(x * 0.045 + frame * 0.12) * 7;
    points.push(`${x},${fillTopY + wave}`);
  }
  const wavePath = `M ${points.join(" L ")} L ${W + STEP},${H + STEP} L ${-STEP},${H + STEP} Z`;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {Array.from({ length: Math.floor(FILL_FRAMES / 10) }).map((_, i) => (
        <Sequence key={i} from={i * 10} durationInFrames={6} layout="none">
          <Audio src={sfxBubble()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={FILL_FRAMES} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1000, 0.1)} volume={0.16} />
      </Sequence>

      {scene.liquidLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.liquidLabel}
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id="liquidClip">
            <rect x={BORDER} y={BORDER} width={W - BORDER * 2} height={H - BORDER * 2} rx={20} />
          </clipPath>
        </defs>
        <rect x={BORDER / 2} y={BORDER / 2} width={W - BORDER} height={H - BORDER} rx={22}
              fill="var(--ink-05)" stroke={accent} strokeWidth={BORDER} />
        <g clipPath="url(#liquidClip)">
          <path d={wavePath} fill={accent} opacity={0.55} style={{ filter: `drop-shadow(0 0 16px ${accent}60)` }} />
        </g>
      </svg>

      {scene.liquidNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.liquidNote}
        </div>
      )}
    </div>
  );
};
