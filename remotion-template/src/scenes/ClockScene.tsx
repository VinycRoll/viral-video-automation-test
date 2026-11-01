import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { VariantFrame } from "../utils/variant";

function parseTime(raw: string | undefined): { h: number; m: number } {
  const m = /^(\d{1,2}):(\d{2})/.exec((raw || "").trim());
  if (!m) return { h: 9, m: 41 };
  return { h: Math.min(23, parseInt(m[1], 10)), m: Math.min(59, parseInt(m[2], 10)) };
}

const DigitalClock: React.FC<{ time: string; accent: string; frame: number }> = ({ time, accent, frame }) => {
  const glow = 0.5 + Math.sin(frame / 18) * 0.15; // pulsação sutil do dois-pontos, nunca congela
  const [hh, mm] = time.split(":");
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center",
                  fontVariantNumeric: "tabular-nums", fontWeight: 900, fontSize: 150,
                  letterSpacing: -4, color: "#fff", textShadow: `0 0 40px ${accent}60, ${SOFT_TEXT_SHADOW}` }}>
      <span>{hh}</span>
      <span style={{ color: accent, opacity: glow, margin: "0 6px" }}>:</span>
      <span>{mm}</span>
    </div>
  );
};

const AnalogClock: React.FC<{ h: number; m: number; accent: string; frame: number; fps: number }> = ({ h, m, accent, frame, fps }) => {
  const targetMinDeg = (m / 60) * 360;
  const targetHourDeg = ((h % 12) / 12) * 360 + (m / 60) * 30;
  const p = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 55 } });
  const minDeg = interpolate(p, [0, 1], [0, targetMinDeg], { extrapolateRight: "clamp" });
  const hourDeg = interpolate(p, [0, 1], [0, targetHourDeg], { extrapolateRight: "clamp" });
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  const size = 480;

  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%",
                  background: "rgba(255,255,255,0.045)", boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.08)" }}>
      {ticks.map((i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%", width: i % 3 === 0 ? 6 : 3, height: i % 3 === 0 ? 26 : 16,
          background: i % 3 === 0 ? accent : "rgba(255,255,255,0.4)", borderRadius: 3,
          transform: `rotate(${i * 30}deg) translateY(-${size / 2 - 22}px)`, transformOrigin: "50% 0",
          marginLeft: i % 3 === 0 ? -3 : -1.5,
        }} />
      ))}
      {/* ponteiro das horas */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: size * 0.26,
                    background: "#fff", borderRadius: 6, transformOrigin: "50% 100%",
                    transform: `translate(-50%, -100%) rotate(${hourDeg}deg)` }} />
      {/* ponteiro dos minutos */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 7, height: size * 0.37,
                    background: accent, borderRadius: 5, transformOrigin: "50% 100%",
                    transform: `translate(-50%, -100%) rotate(${minDeg}deg)`,
                    boxShadow: `0 0 16px ${accent}90` }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 20, height: 20,
                    marginLeft: -10, marginTop: -10, borderRadius: "50%", background: accent }} />
    </div>
  );
};

// Relógio digital (glow neon) ou analógico (ponteiros animando até o horário alvo) —
// usado quando o roteiro cita um horário específico ou a passagem de um tempo do dia.
export const ClockScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { h, m } = parseTime(scene.clockTime);
  const digital = (scene.clockType || "digital") !== "analog";

  const wrapOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wrapScale = interpolate(frame, [0, 14], [0.85, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const noteOp = interpolate(frame, [26, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ opacity: wrapOp, transform: `scale(${wrapScale})` }}>
        <VariantFrame variant={variant} accent={accent}>
          {digital
            ? <DigitalClock time={`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`} accent={accent} frame={frame} />
            : <AnalogClock h={h} m={m} accent={accent} frame={frame} fps={fps} />}
        </VariantFrame>
      </div>
      {scene.clockNote && (
        <div style={{ opacity: noteOp, fontSize: 36, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.clockNote}
        </div>
      )}
    </div>
  );
};
