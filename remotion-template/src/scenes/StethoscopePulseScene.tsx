import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxImpact } from "../utils/soundSynth";

const SIZE = 320;
const CENTER = SIZE / 2;
const LAND_FRAME = 16;
const BEAT_PERIOD = 28;

// Campânula circular pousa sobre um ponto e emite pulsos sincronizados com batida dupla
// (lub-dub). Use pra DIAGNÓSTICO, saúde financeira/física ou monitoramento contínuo.
export const StethoscopePulseScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bellY = interpolate(frame, [0, LAND_FRAME], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sinceLand = Math.max(0, frame - LAND_FRAME);
  const cycle = sinceLand % BEAT_PERIOD;

  const pulse1 = interpolate(cycle, [0, 16], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse1Op = interpolate(cycle, [0, 16], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse2 = interpolate(cycle, [6, 20], [0, 48], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse2Op = interpolate(cycle, [6, 20], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const noteOp = interpolate(frame, [LAND_FRAME + BEAT_PERIOD * 2, LAND_FRAME + BEAT_PERIOD * 2 + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {Array.from({ length: 8 }).map((_, c) => (
        <React.Fragment key={c}>
          <Sequence from={LAND_FRAME + c * BEAT_PERIOD} durationInFrames={13} layout="none">
            <Audio src={sfxImpact(0.2)} volume={0.18} />
          </Sequence>
          <Sequence from={LAND_FRAME + c * BEAT_PERIOD + 6} durationInFrames={13} layout="none">
            <Audio src={sfxImpact(0.16)} volume={0.15} />
          </Sequence>
        </React.Fragment>
      ))}

      {scene.stethoscopeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.stethoscopeLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {sinceLand > 0 && (
          <>
            {pulse1 > 0 && <circle cx={CENTER} cy={CENTER} r={pulse1} fill="none" stroke={accent} strokeWidth={3} opacity={pulse1Op} />}
            {pulse2 > 0 && <circle cx={CENTER} cy={CENTER} r={pulse2} fill="none" stroke={accent} strokeWidth={3} opacity={pulse2Op} />}
          </>
        )}
        <g transform={`translate(0 ${bellY})`}>
          <circle cx={CENTER} cy={CENTER} r={34} fill="var(--ink-1)" stroke="#ccc" strokeWidth={6} />
          <circle cx={CENTER} cy={CENTER} r={10} fill={accent} style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
        </g>
      </svg>

      {scene.stethoscopeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.stethoscopeNote}
        </div>
      )}
    </div>
  );
};
