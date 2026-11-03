import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxBeep } from "../utils/soundSynth";

const STAGE_GAP = 18; // frames entre cada estágio aparecendo
const START = 6;
const TRACK_LEFT = 12;
const TRACK_RIGHT = 88;

const Stage: React.FC<{ label: string; index: number; accent: string; isLast: boolean }> = ({
  label, index, accent, isLast,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = START + index * STAGE_GAP;
  const p = spring({ fps, frame: frame - start, config: { damping: 13, stiffness: 150 } });
  const scale = interpolate(p, [0, 1], [0, 1]);
  const labelOp = interpolate(frame, [start + 4, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const color = isLast ? accent : "var(--ink-85)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, flex: 1 }}>
      <div style={{ width: 54, height: 54, borderRadius: 14, transform: `scale(${scale})`,
                    background: isLast ? color : "var(--ink-12)", border: `3px solid ${color}`,
                    boxShadow: isLast ? `0 0 18px ${accent}90` : "none" }} />
      <div style={{ opacity: labelOp, fontSize: 20, fontWeight: 700, color: "var(--ink)", textAlign: "center",
                    letterSpacing: 0.2, textShadow: SOFT_TEXT_SHADOW, padding: "0 4px" }}>
        {label}
      </div>
      <Sequence from={start} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(500 + index * 120)} volume={0.15} />
      </Sequence>
    </div>
  );
};

// Linha de 4 estágios revelados em sequência, com o último destacado em accent, sem foto
// de fundo. Use pra ilustrar uma EVOLUÇÃO passo a passo que já aconteceu (ex: "como o Pix
// mudou em 4 fases") — diferente de "roadmap" (um plano futuro, não um histórico).
export const EvolutionMorphScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const stages = scene.evoStages || [];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastStart = START + Math.max(0, stages.length - 1) * STAGE_GAP;
  const noteOp = interpolate(frame, [lastStart + 26, lastStart + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const chunkWidth = (TRACK_RIGHT - TRACK_LEFT) / Math.max(1, stages.length - 1);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 48, padding: "0 70px", boxSizing: "border-box" }}>
      {scene.evoLabel && (
        <div style={{ opacity: labelOp, fontSize: 32, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.evoLabel}
        </div>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "flex-start" }}>
        <div style={{ position: "absolute", left: `${TRACK_LEFT}%`, right: `${100 - TRACK_RIGHT}%`, top: 26, height: 4,
                      background: "var(--ink-15)", borderRadius: 2 }} />
        {stages.slice(0, -1).map((_, i) => {
          const segStart = START + (i + 1) * STAGE_GAP - 10;
          const segP = interpolate(frame, [segStart, segStart + 12], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ position: "absolute", left: `${TRACK_LEFT + i * chunkWidth}%`, top: 26, height: 4,
                                   width: `${(chunkWidth * segP) / 100}%`, background: accent, borderRadius: 2,
                                   boxShadow: `0 0 10px ${accent}80` }} />
          );
        })}
        {stages.map((s, i) => (
          <Stage key={i} label={s.label} index={i} accent={accent} isLast={i === stages.length - 1} />
        ))}
      </div>

      {scene.evoNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.evoNote}
        </div>
      )}

      <Sequence from={START} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.14} />
      </Sequence>
    </div>
  );
};
