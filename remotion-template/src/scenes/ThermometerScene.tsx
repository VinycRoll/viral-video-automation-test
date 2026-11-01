import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const TUBE_W = 56;
const TUBE_H = 340;
const BULB_SIZE = 110;

// Termômetro enchendo de baixo pra cima (bulbo + tubo), sem foto de fundo. Usado quando o
// roteiro fala de NÍVEL ou INTENSIDADE (ex: "nível de risco", "quanto você já economizou
// do seu objetivo") — diferente de "battery" (literal/energia) e "progress" (anel/meta %).
export const ThermometerScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const target = Math.max(0, Math.min(100, scene.thermoPct ?? 50));

  const fillP = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 55 }, durationInFrames: 50 });
  const pct = interpolate(fillP, [0, 1], [0, target]);
  const fillHeight = (pct / 100) * TUBE_H;

  const bodyOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pctOp = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28 }}>
      {scene.thermoLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.thermoLabel}
        </div>
      )}

      <div style={{ position: "relative", width: TUBE_W + 40, height: TUBE_H + BULB_SIZE, opacity: bodyOp,
                    display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: TUBE_W, height: TUBE_H, borderRadius: TUBE_W,
                      border: "6px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)",
                      overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 4, right: 4, bottom: -BULB_SIZE / 2, height: fillHeight + BULB_SIZE / 2,
                        background: accent, boxShadow: `0 0 20px ${accent}80` }} />
          {[20, 40, 60, 80].map((tick) => (
            <div key={tick} style={{ position: "absolute", left: -16, bottom: `${tick}%`,
                                      width: 10, height: 3, background: "rgba(255,255,255,0.35)" }} />
          ))}
        </div>
        <div style={{ position: "relative", width: BULB_SIZE, height: BULB_SIZE, marginTop: -10, borderRadius: "50%",
                      border: "6px solid rgba(255,255,255,0.3)", background: accent,
                      boxShadow: `0 0 28px ${accent}90` }} />
      </div>

      <div style={{ opacity: pctOp, fontSize: 64, fontWeight: 900, color: "#fff",
                    fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
        {Math.round(pct)}<span style={{ fontSize: 36, color: accent }}>%</span>
      </div>

      {scene.thermoNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.thermoNote}
        </div>
      )}
    </div>
  );
};
