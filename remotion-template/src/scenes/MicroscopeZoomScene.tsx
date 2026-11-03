import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxBeep } from "../utils/soundSynth";

const SIZE = 320;
const R = 140;
const CX = SIZE / 2;
const CY = SIZE / 2;
const LEVEL_DURATION = 60;

// Zoom óptico em múltiplos níveis de ampliação dentro de uma lente circular, com
// efeito de blur->sharp a cada troca de nível. Use pra revelar um detalhe
// microscópico escondido num fato (células, microorganismos, partículas).
export const MicroscopeZoomScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const levels = scene.microscopeLevels || [{ label: "10x" }, { label: "100x" }, { label: "1000x" }];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const currentIndex = Math.min(Math.floor(frame / LEVEL_DURATION), levels.length - 1);
  const levelStart = currentIndex * LEVEL_DURATION;
  const localFrame = frame - levelStart;
  const blur = interpolate(localFrame, [0, 20], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const levelOp = interpolate(localFrame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoomScale = 1 + currentIndex * 1.1;

  const noteStart = levels.length * LEVEL_DURATION + 10;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {levels.map((_, i) => {
        if (i === 0) return null;
        const levelStart = i * LEVEL_DURATION;
        return (
          <React.Fragment key={i}>
            <Sequence from={levelStart} durationInFrames={4} layout="none">
              <Audio src={sfxTick()} volume={0.1} />
            </Sequence>
            <Sequence from={levelStart + 20} durationInFrames={6} layout="none">
              <Audio src={sfxBeep(1000, 0.08)} volume={0.14} />
            </Sequence>
          </React.Fragment>
        );
      })}

      {scene.microscopeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.microscopeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <clipPath id="lensClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="#0a0e14" stroke="var(--ink-2)" strokeWidth={3} />

        <g clipPath="url(#lensClip)" style={{ filter: `blur(${blur}px)` }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1={CX - R} y1={CY - R + (i * R * 2) / 7} x2={CX + R} y2={CY - R + (i * R * 2) / 7}
                  stroke="var(--ink-08)" strokeWidth={1} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`v${i}`} x1={CX - R + (i * R * 2) / 7} y1={CY - R} x2={CX - R + (i * R * 2) / 7} y2={CY + R}
                  stroke="var(--ink-08)" strokeWidth={1} />
          ))}
          <circle cx={CX} cy={CY} r={18 * zoomScale} fill={accent} opacity={0.85}
                  style={{ filter: `drop-shadow(0 0 16px ${accent})` }} />
          <circle cx={CX - 10 * zoomScale} cy={CY + 8 * zoomScale} r={7 * zoomScale} fill="var(--ink)" opacity={0.5} />
        </g>

        <line x1={CX - R - 10} y1={CY} x2={CX + R + 10} y2={CY} stroke="var(--ink-35)" strokeWidth={1.5} />
        <line x1={CX} y1={CY - R - 10} x2={CX} y2={CY + R + 10} stroke="var(--ink-35)" strokeWidth={1.5} />

        <text x={CX} y={CY + R + 36} fill={accent} fontSize={22} fontWeight={800} textAnchor="middle" opacity={levelOp}>
          {levels[currentIndex]?.label}
        </text>
      </svg>

      {scene.microscopeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.microscopeNote}
        </div>
      )}
    </div>
  );
};
