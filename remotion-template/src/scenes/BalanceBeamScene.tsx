import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const BEAM_HALF = 240;
const TILT_DEG = 6; // tombamento final sutil — os dois lados ficam quase nivelados
const TILT_START = 18;

const WeightCluster: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -100%)",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: "var(--ink-8)" }} />
    ))}
  </div>
);

// Gangorra com muitos pesos pequenos de um lado e um bloco único grande do outro, sem
// foto de fundo. Use quando o roteiro contrasta "muitos itens pequenos" com "um item
// grande" e a virada é mostrar que os dois lados pesam quase igual.
export const BalanceBeamScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tiltP = spring({ fps, frame: frame - TILT_START, config: { damping: 16, stiffness: 60 } });
  const theta = (TILT_DEG * tiltP * Math.PI) / 180;

  const leftX = -BEAM_HALF * Math.cos(theta);
  const leftY = -BEAM_HALF * Math.sin(theta);
  const rightX = BEAM_HALF * Math.cos(theta);
  const rightY = BEAM_HALF * Math.sin(theta);

  const introOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={TILT_START} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      <Sequence from={48} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.18} />
      </Sequence>
      {scene.beamLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.beamLabel}
        </div>
      )}

      <div style={{ position: "relative", width: 560, height: 300, opacity: introOp }}>
        <div style={{ position: "absolute", left: "50%", top: 150, transform: "translateX(-50%)",
                      width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent",
                      borderBottom: "46px solid var(--ink-25)" }} />

        <div style={{ position: "absolute", left: "50%", top: 150, width: BEAM_HALF * 2, height: 6,
                      background: "var(--ink-55)", transformOrigin: "50% 50%",
                      transform: `translate(-50%, -50%) rotate(${(theta * 180) / Math.PI}deg)` }} />

        <WeightCluster x={280 + leftX} y={150 + leftY - 4} />
        <div style={{ position: "absolute", left: 280 + rightX, top: 150 + rightY - 4, transform: "translate(-50%, -100%)",
                      width: 64, height: 78, borderRadius: 10, background: accent,
                      boxShadow: `0 0 20px ${accent}70` }} />

        <div style={{ position: "absolute", left: 280 + leftX, top: 150 + leftY + 30, transform: "translate(-50%, 0)",
                      textAlign: "center", width: 160 }}>
          {scene.beamManyValue && (
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", textShadow: SOFT_TEXT_SHADOW }}>
              {scene.beamManyValue}
            </div>
          )}
          {scene.beamManyLabel && (
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: "var(--ink-85)",
                          textTransform: "uppercase", letterSpacing: 0.4, textShadow: SOFT_TEXT_SHADOW }}>
              {scene.beamManyLabel}
            </div>
          )}
        </div>

        <div style={{ position: "absolute", left: 280 + rightX, top: 150 + rightY + 30, transform: "translate(-50%, 0)",
                      textAlign: "center", width: 160 }}>
          {scene.beamOneValue && (
            <div style={{ fontSize: 26, fontWeight: 900, color: accent, textShadow: SOFT_TEXT_SHADOW }}>
              {scene.beamOneValue}
            </div>
          )}
          {scene.beamOneLabel && (
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: "var(--ink-85)",
                          textTransform: "uppercase", letterSpacing: 0.4, textShadow: SOFT_TEXT_SHADOW }}>
              {scene.beamOneLabel}
            </div>
          )}
        </div>
      </div>

      {scene.beamNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.beamNote}
        </div>
      )}
    </div>
  );
};
