import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { VariantFrame } from "../utils/variant";
import { sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

const BADGE_SIZE = 180;
const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z";

// Linhas de burst atrás do badge, aparecem e somem rápido junto com o "pop" (sticker de conquista).
const Burst: React.FC<{ accent: string; op: number }> = ({ accent, op }) => (
  <div style={{ position: "absolute", inset: -40, opacity: op }}>
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} style={{
        position: "absolute", left: "50%", top: "50%", width: 4, height: 30,
        background: accent, borderRadius: 2,
        transform: `rotate(${i * 30}deg) translate(-50%, -${BADGE_SIZE / 2 + 18}px)`,
      }} />
    ))}
  </div>
);

// Badge de conquista (estrela/medalha) "pipocando" com burst e fitas, sem foto de fundo.
// Usado quando o roteiro cita uma meta batida, marco ou conquista desbloqueada.
export const AchievementScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popP = spring({ fps, frame, config: { damping: 11, stiffness: 160 } });
  const scale = interpolate(popP, [0, 1], [0, 1]);
  const burstOp = interpolate(frame, [0, 8, 20], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 30 }}>
      {scene.achievementLabel && (
        <div style={{ opacity: labelOp, fontSize: 28, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px",
                      textTransform: "uppercase" }}>
          {scene.achievementLabel}
        </div>
      )}

      <VariantFrame variant={variant} accent={accent}>
        <div style={{ position: "relative", width: BADGE_SIZE, height: BADGE_SIZE + 46, transform: `scale(${scale})` }}>
          <Burst accent={accent} op={burstOp} />
          <div style={{ position: "absolute", left: BADGE_SIZE / 2 - 54, top: BADGE_SIZE - 30,
                        width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent",
                        borderTop: `58px solid ${accent}c0`, transform: "rotate(-14deg)" }} />
          <div style={{ position: "absolute", left: BADGE_SIZE / 2 + 2, top: BADGE_SIZE - 30,
                        width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent",
                        borderTop: `58px solid ${accent}c0`, transform: "rotate(14deg)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 30%, ${accent}, ${accent}aa)`,
                        boxShadow: `0 0 36px ${accent}80`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={88} height={88} viewBox="0 0 24 24">
              <path d={STAR_PATH} fill="var(--ink)" />
            </svg>
          </div>
        </div>
      </VariantFrame>

      {scene.achievementTitle && (
        <div style={{ opacity: titleOp, fontSize: 40, fontWeight: 900, color: "var(--ink)", textAlign: "center",
                      letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.achievementTitle}
        </div>
      )}

      {scene.achievementNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.achievementNote}
        </div>
      )}

      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh()} volume={0.15} />
      </Sequence>
      <Sequence from={20} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
    </div>
  );
};
