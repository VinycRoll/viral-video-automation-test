import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxAlert, sfxImpact } from "../utils/soundSynth";

const BLOCK_W = 110;
const BLOCK_H = 150;
const FLIP_FRAME = 60;
const SNAP_FRAME = FLIP_FRAME + 16;

// Dois blocos que se repelem elasticamente (tremor perto um do outro, sem se tocar)
// até um girar 180° e colarem instantaneamente no centro, corte abrupto. Use pra
// REPULSÃO que se torna ATRAÇÃO, ou opostos que se atraem.
export const MagneticPolesScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const approachP = interpolate(frame, [0, FLIP_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gap = interpolate(approachP, [0, 1], [150, 34]);
  const jitter = Math.sin(frame * 1.8) * 6 * approachP;

  const flipP = interpolate(frame, [FLIP_FRAME, FLIP_FRAME + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightScaleX = interpolate(flipP, [0, 1], [1, -1]);

  const snapped = frame >= SNAP_FRAME;
  const leftX = snapped ? -BLOCK_W / 2 : -gap + jitter;
  const rightX = snapped ? BLOCK_W / 2 : gap + jitter;

  const noteOp = interpolate(frame, [SNAP_FRAME + 10, SNAP_FRAME + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const blockStyle: React.CSSProperties = {
    position: "absolute", top: "50%", width: BLOCK_W, height: BLOCK_H,
    borderRadius: 12, background: "var(--ink-08)", border: `3px solid ${accent}`,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px",
    boxShadow: snapped ? `0 0 24px ${accent}80` : "none",
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.magneticLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.magneticLabel}
        </div>
      )}

      <div style={{ position: "relative", width: 340, height: BLOCK_H + 20 }}>
        <div style={{ ...blockStyle, left: "50%", transform: `translate(calc(-50% + ${leftX}px), -50%)` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", textAlign: "center",
                        textTransform: "uppercase", textShadow: SOFT_TEXT_SHADOW }}>
            {scene.magneticLeftLabel}
          </div>
        </div>
        <div style={{ ...blockStyle, left: "50%",
                      transform: `translate(calc(-50% + ${rightX}px), -50%) scaleX(${rightScaleX})` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", textAlign: "center",
                        textTransform: "uppercase", textShadow: SOFT_TEXT_SHADOW }}>
            {scene.magneticRightLabel}
          </div>
        </div>
      </div>

      {scene.magneticNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.magneticNote}
        </div>
      )}

      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxAlert()} volume={0.14} />
      </Sequence>
      <Sequence from={SNAP_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
    </div>
  );
};
