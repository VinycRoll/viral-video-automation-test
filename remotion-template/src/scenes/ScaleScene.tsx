import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const BEAM_HALF = 220;
const STRING_LEN = 90;
const TILT_DEG = 9;
const TILT_START = 18; // frame em que a balança começa a pender pro lado vencedor

const Pan: React.FC<{ x: number; y: number; label?: string; value?: string; accent?: string; lit: boolean }> = ({
  x, y, label, value, accent, lit,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, 0)", textAlign: "center" }}>
    <div style={{
      minWidth: 170, minHeight: 70, padding: "10px 18px 14px", borderRadius: "0 0 60px 60px",
      border: `3px solid ${lit ? accent : "rgba(255,255,255,0.35)"}`,
      borderTop: "none",
      background: lit ? `${accent}22` : "rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: lit ? `0 0 20px ${accent}70` : "none",
      whiteSpace: "nowrap",
    }}>
      {value && (
        <span style={{ fontSize: 28, fontWeight: 900, color: lit ? accent : "#fff", textShadow: SOFT_TEXT_SHADOW }}>
          {value}
        </span>
      )}
    </div>
    {label && (
      <div style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.85)",
                    textTransform: "uppercase", letterSpacing: 0.5, textShadow: SOFT_TEXT_SHADOW }}>
        {label}
      </div>
    )}
  </div>
);

// Balança de dois pratos (estilo native-ui) pendendo pro lado vencedor, sem foto de
// fundo. Usado quando o roteiro faz uma COMPARAÇÃO direta entre duas opções (ex:
// "alugar ou financiar", "risco vs retorno").
export const ScaleScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const winner = scene.scaleWinner === "left" ? -1 : 1;

  const tiltP = spring({ fps, frame: frame - TILT_START, config: { damping: 14, stiffness: 60 } });
  const theta = ((winner * TILT_DEG * tiltP) * Math.PI) / 180;

  const leftX = -BEAM_HALF * Math.cos(theta);
  const leftY = -BEAM_HALF * Math.sin(theta);
  const rightX = BEAM_HALF * Math.cos(theta);
  const rightY = BEAM_HALF * Math.sin(theta);

  const introOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36 }}>
      {scene.scaleLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.scaleLabel}
        </div>
      )}

      <div style={{ position: "relative", width: 560, height: 280, opacity: introOp }}>
        {/* fulcro (tripé) */}
        <div style={{
          position: "absolute", left: "50%", top: 70, transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent",
          borderBottom: "46px solid rgba(255,255,255,0.25)",
        }} />
        <div style={{ position: "absolute", left: "50%", top: 24, width: 6, height: 46, background: "rgba(255,255,255,0.25)", transform: "translateX(-50%)" }} />

        {/* viga */}
        <div style={{
          position: "absolute", left: "50%", top: 70, width: BEAM_HALF * 2, height: 6,
          background: "rgba(255,255,255,0.5)", transformOrigin: "50% 50%",
          transform: `translate(-50%, -50%) rotate(${(theta * 180) / Math.PI}deg)`,
        }} />

        {/* cordas + pratos */}
        <svg width={560} height={280} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <line x1={280 + leftX} y1={70 + leftY} x2={280 + leftX} y2={70 + leftY + STRING_LEN}
                stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
          <line x1={280 + rightX} y1={70 + rightY} x2={280 + rightX} y2={70 + rightY + STRING_LEN}
                stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        </svg>

        <Pan x={280 + leftX} y={70 + leftY + STRING_LEN} label={scene.scaleLeftLabel} value={scene.scaleLeftValue}
             accent={accent} lit={winner === -1 && tiltP > 0.3} />
        <Pan x={280 + rightX} y={70 + rightY + STRING_LEN} label={scene.scaleRightLabel} value={scene.scaleRightValue}
             accent={accent} lit={winner === 1 && tiltP > 0.3} />
      </div>

      {scene.scaleNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.scaleNote}
        </div>
      )}
    </div>
  );
};
