import React from "react";
import { useCurrentFrame, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const CARD_W = 300;
const CARD_H = 200;
const DESCENT_START = 30;
const IMPACT_FRAME = 40;

// Documento recebe o impacto de um carimbo descendo rápido (com tremor de câmera
// e partículas de tinta) deixando uma marca angulada. Use pra APROVAÇÃO, veto ou
// decisão oficial/burocrática.
export const StampApprovalScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const word = scene.stampWord || "APROVADO";

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const descentFrame = Math.max(0, frame - DESCENT_START);
  const stampProgress = spring({ frame: descentFrame, fps: 30, config: { damping: 14, stiffness: 180 } });
  const preImpact = frame < DESCENT_START;
  const stampScale = preImpact ? 3 : interpolate(stampProgress, [0, 1], [3, 1], { extrapolateRight: "clamp" });
  const stampOp = preImpact ? 0 : interpolate(frame, [DESCENT_START, DESCENT_START + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shakeAmt = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 6], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeX = shakeAmt * Math.sin(frame * 9);
  const shakeY = shakeAmt * 0.6 * Math.cos(frame * 11);

  const markOp = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [IMPACT_FRAME + 20, IMPACT_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const particles = Array.from({ length: 10 }).map((_, i) => {
    const ang = (360 / 10) * i;
    const dist = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 15], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const op = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rad = (ang * Math.PI) / 180;
    return { x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, op };
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={IMPACT_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      {scene.stampLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.stampLabel}
        </div>
      )}

      <div style={{ position: "relative", width: CARD_W, height: CARD_H, transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <div style={{ width: CARD_W, height: CARD_H, backgroundColor: "#f4f4f0", borderRadius: 6,
                      display: "flex", flexDirection: "column", gap: 14, padding: 24, boxSizing: "border-box" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 8, width: i === 5 ? "50%" : "100%", backgroundColor: "#c7c7c0", borderRadius: 2 }} />
          ))}
        </div>

        {particles.map((pt, i) => (
          <div key={i} style={{ position: "absolute", left: CARD_W / 2 + pt.x, top: CARD_H / 2 + pt.y,
                                 width: 5, height: 5, borderRadius: "50%", backgroundColor: accent, opacity: pt.op }} />
        ))}

        <div style={{ position: "absolute", left: "50%", top: "50%",
                      transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-15deg)`,
                      opacity: stampOp, border: `5px solid ${accent}`, borderRadius: 10,
                      padding: "10px 24px", fontSize: 32, fontWeight: 800, color: accent,
                      textTransform: "uppercase", letterSpacing: 2 }}>
          {frame >= IMPACT_FRAME ? <span style={{ opacity: markOp }}>{word}</span> : word}
        </div>
      </div>

      {scene.stampNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.stampNote}
        </div>
      )}
    </div>
  );
};
