import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const BATT_W = 140;
const BATT_H = 240;
const NUB_W = 50;
const NUB_H = 16;

// Bateria carregando (enche de baixo pra cima), sem foto de fundo. Diferente de `progress`
// (anel) — usado quando o roteiro fala de energia/força/reserva se acumulando aos poucos
// (ex: "sua reserva de emergência carrega aos poucos", "sua energia financeira").
export const BatteryScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const target = Math.max(0, Math.min(100, scene.batteryPct ?? 50));

  const fillP = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 55 }, durationInFrames: 50 });
  const pct = interpolate(fillP, [0, 1], [0, target]);
  const innerH = BATT_H - 10;
  const fillHeight = (pct / 100) * innerH;

  const bodyOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pctOp = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28 }}>
      {scene.batteryLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.batteryLabel}
        </div>
      )}

      <div style={{ position: "relative", width: BATT_W, height: BATT_H + NUB_H, opacity: bodyOp,
                    display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: NUB_W, height: NUB_H, background: "rgba(255,255,255,0.4)", borderRadius: "4px 4px 0 0" }} />
        <div style={{ position: "relative", width: BATT_W, height: BATT_H,
                      border: "6px solid rgba(255,255,255,0.35)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 5, right: 5, bottom: 5, height: fillHeight,
                        background: accent, borderRadius: 10, boxShadow: `0 0 20px ${accent}80` }} />
        </div>
      </div>

      <div style={{ opacity: pctOp, fontSize: 64, fontWeight: 900, color: "#fff",
                    fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
        {Math.round(pct)}<span style={{ fontSize: 36, color: accent }}>%</span>
      </div>

      {scene.batteryNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.batteryNote}
        </div>
      )}
    </div>
  );
};
