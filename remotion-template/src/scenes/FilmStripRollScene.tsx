import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxImpact } from "../utils/soundSynth";

const CELL_W = 110;
const CELL_H = 170;
const STEP_FRAMES = 15;
const TARGET_SHIFT = 3;

// Rolo de película de 35mm que desliza quadro a quadro (passos discretos, sem suavização)
// até parar num quadro que se ilumina como projetor focando, sem foto de fundo. Use pra
// MEMÓRIA, flashback ou um momento específico em destaque dentro de uma sequência.
export const FilmStripRollScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shiftIndex = Math.min(Math.floor(frame / STEP_FRAMES), TARGET_SHIFT);
  const stripOffsetX = -shiftIndex * CELL_W;

  const litStart = TARGET_SHIFT * STEP_FRAMES + 5;
  const glowOp = interpolate(frame, [litStart, litStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [litStart, litStart + 15], [1, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [litStart + 6, litStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [litStart + 26, litStart + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cells = Array.from({ length: 7 });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.filmstripLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.filmstripLabel}
        </div>
      )}

      <div style={{ width: 320, height: CELL_H, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 100 + stripOffsetX, top: 0, display: "flex" }}>
          {cells.map((_, i) => {
            const isTarget = i === TARGET_SHIFT;
            const cellScale = isTarget ? scale : 1;
            const cellGlow = isTarget ? glowOp : 0;
            return (
              <div key={i} style={{ width: CELL_W, height: CELL_H, flexShrink: 0, position: "relative",
                                     background: "#0b0b0d", border: "2px solid #1a1a1d", boxSizing: "border-box",
                                     transform: `scale(${cellScale})`,
                                     boxShadow: cellGlow > 0 ? `0 0 ${24 * cellGlow}px ${accent}` : "none" }}>
                {/* perfurações */}
                {Array.from({ length: 3 }).map((__, h) => (
                  <React.Fragment key={h}>
                    <div style={{ position: "absolute", left: 10 + h * 42, top: 6, width: 14, height: 10, borderRadius: 3, background: "#000" }} />
                    <div style={{ position: "absolute", left: 10 + h * 42, bottom: 6, width: 14, height: 10, borderRadius: 3, background: "#000" }} />
                  </React.Fragment>
                ))}
                <div style={{ position: "absolute", left: 8, top: 24, right: 8, bottom: 24,
                               background: isTarget ? `rgba(255,255,255,${0.08 + 0.1 * cellGlow})` : "var(--ink-05)",
                               display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
                  {isTarget && scene.filmstripTitle && (
                    <div style={{ opacity: titleOp, color: "var(--ink)", fontWeight: 800, fontSize: 15, textAlign: "center" }}>
                      {scene.filmstripTitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scene.filmstripNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.filmstripNote}
        </div>
      )}

      {Array.from({ length: TARGET_SHIFT }).map((_, i) => (
        <Sequence key={i} from={(i + 1) * STEP_FRAMES} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.13} />
        </Sequence>
      ))}
      <Sequence from={litStart} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.19} />
      </Sequence>
    </div>
  );
};
