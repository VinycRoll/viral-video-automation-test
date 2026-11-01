import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW } from "../utils/text";

const SETTLE_FRAME = 22;

// Duas metades colidindo na diagonal com um emblema "VS" pulsante no centro — use pra
// comparar dois animais, países ou fenômenos num confronto direto, diferente de "split"
// (comparação passiva lado a lado, sem a ideia de colisão/confronto).
export const VsBattleScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftP = spring({ fps, frame, config: { damping: 10, stiffness: 110 } });
  const leftX = interpolate(leftP, [0, 1], [-520, 0]);
  const rightP = spring({ fps, frame, config: { damping: 10, stiffness: 110 } });
  const rightX = interpolate(rightP, [0, 1], [520, 0]);

  const vsP = spring({ fps, frame: frame - SETTLE_FRAME, config: { damping: 9, stiffness: 160 } });
  const vsScale = interpolate(vsP, [0, 1], [0, 1]);
  const vsPulse = 1 + Math.sin(frame / 6) * 0.08;

  const noteOp = interpolate(frame, [SETTLE_FRAME + 20, SETTLE_FRAME + 32], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const Half: React.FC<{ side: "left" | "right"; x: number; label?: string; value?: string }> = ({ side, x, label, value }) => (
    <div style={{
      position: "absolute", top: "15%", height: "70%", width: "44%",
      ...(side === "left" ? { left: "4%" } : { right: "4%" }),
      transform: `translateX(${x}px) rotate(${side === "left" ? -4 : 4}deg)`,
      borderRadius: 28, background: "rgba(255,255,255,0.06)",
      border: `2px solid ${accent}55`, boxShadow: "0 24px 50px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
      padding: "0 18px",
    }}>
      {label && (
        <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase",
                      letterSpacing: 1, textAlign: "center" }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", textAlign: "center",
                    letterSpacing: -1, textShadow: SOFT_TEXT_SHADOW }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Half side="left" x={leftX} label={scene.vsLeftLabel} value={scene.vsLeftValue} />
      <Half side="right" x={rightX} label={scene.vsRightLabel} value={scene.vsRightValue} />

      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: `translate(-50%, -50%) scale(${vsScale * vsPulse})`,
        width: 120, height: 120, borderRadius: "50%", background: "#0b0b10",
        border: `4px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 36px ${accent}60`,
      }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: accent, letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          VS
        </div>
      </div>

      {scene.vsNote && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: "10%", opacity: noteOp,
          fontSize: 34, fontWeight: 800, color: accent, textAlign: "center",
          textTransform: "uppercase", letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px",
        }}>
          {scene.vsNote}
        </div>
      )}
    </div>
  );
};
