import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBeep } from "../utils/soundSynth";

const SIZE = 320;
const R = 150;
const CX = SIZE / 2;
const CY = SIZE / 2;
const DEG_PER_FRAME = 2; // uma volta completa a cada 180 frames (6s a 30fps)

const mod360 = (x: number) => ((x % 360) + 360) % 360;

// Tela de radar circular com varredura contínua, sem foto de fundo. Use pra ilustrar
// "sinais detectados" ou "pontos de atenção revelados um a um" — os blips só acendem
// quando o feixe passa por eles, diferente de "roadmap" (sequência fixa de etapas, não
// uma varredura cíclica).
export const RadarSonarScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const blips = scene.radarBlips || [];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sweepRaw = frame * DEG_PER_FRAME;
  const sweepDisplay = sweepRaw - 90;

  const lastPassFrame = blips.length
    ? Math.max(...blips.map((_, i) => ((360 / blips.length) * i) / DEG_PER_FRAME))
    : 0;
  const noteStart = lastPassFrame + 40;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.radarLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.radarLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CY} r={R} fill="#06130a" stroke="var(--ink-15)" strokeWidth={2} />
        <circle cx={CX} cy={CY} r={R * 0.66} fill="none" stroke="var(--ink-12)" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={R * 0.33} fill="none" stroke="var(--ink-12)" strokeWidth={1.5} />

        <g transform={`rotate(${sweepDisplay}, ${CX}, ${CY})`}>
          <line x1={CX} y1={CY} x2={CX + R} y2={CY} stroke={accent} strokeWidth={3}
                style={{ filter: `drop-shadow(0 0 10px ${accent}90)` }} />
        </g>

        {blips.map((b, i) => {
          const angleRaw0 = blips.length ? (360 / blips.length) * i : 0;
          const firstPass0 = angleRaw0 / DEG_PER_FRAME;
          return Array.from({ length: 4 }).map((_, c) => (
            <Sequence key={`sfx-${i}-${c}`} from={Math.round(firstPass0 + c * (360 / DEG_PER_FRAME))} durationInFrames={6} layout="none">
              <Audio src={sfxBeep(1100, 0.1)} volume={0.14} />
            </Sequence>
          ));
        })}
        {blips.map((b, i) => {
          const angleRaw = blips.length ? (360 / blips.length) * i : 0;
          const radius = R * (0.45 + 0.18 * (i % 3));
          const rad = ((angleRaw - 90) * Math.PI) / 180;
          const x = CX + radius * Math.cos(rad);
          const y = CY + radius * Math.sin(rad);
          const firstPass = angleRaw / DEG_PER_FRAME;
          const hasPassed = frame >= firstPass;
          const delta = mod360(sweepRaw - angleRaw);
          const flash = interpolate(delta, [0, 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pop = 1 + interpolate(delta, [0, 10], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const dotOp = hasPassed ? Math.max(0.5, flash) : 0;
          const labelFade = hasPassed
            ? interpolate(delta, [0, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0;

          return (
            <g key={i} opacity={dotOp}>
              <circle cx={x} cy={y} r={7 * (hasPassed ? pop : 1)} fill={accent}
                      style={{ filter: flash > 0.2 ? `drop-shadow(0 0 12px ${accent})` : "none" }} />
              <text x={x + 14} y={y + 5} fill="var(--ink)" fontSize={16} fontWeight={700} opacity={labelFade}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>

      {scene.radarNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.radarNote}
        </div>
      )}
    </div>
  );
};
