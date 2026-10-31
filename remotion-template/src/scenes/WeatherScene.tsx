import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const ICON = 160;

const Cloud: React.FC<{ color?: string }> = ({ color = "rgba(255,255,255,0.9)" }) => (
  <div style={{ position: "absolute", left: 10, top: 62, width: 140, height: 56 }}>
    <div style={{ position: "absolute", left: 0, top: 20, width: 140, height: 36, borderRadius: 20, background: color }} />
    <div style={{ position: "absolute", left: 14, top: 0, width: 50, height: 50, borderRadius: "50%", background: color }} />
    <div style={{ position: "absolute", left: 56, top: -8, width: 62, height: 62, borderRadius: "50%", background: color }} />
    <div style={{ position: "absolute", left: 100, top: 6, width: 44, height: 44, borderRadius: "50%", background: color }} />
  </div>
);

const Sun: React.FC<{ accent: string; frame: number; small?: boolean }> = ({ accent, frame, small }) => {
  const size = small ? 54 : 84;
  const rayDeg = frame * 0.6;
  return (
    <div style={{ position: "absolute", left: small ? 86 : ICON / 2 - size / 2, top: small ? 4 : ICON / 2 - size / 2 }}>
      <div style={{ position: "absolute", left: -18, top: -18, width: size + 36, height: size + 36,
                    transform: `rotate(${rayDeg}deg)` }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: "50%", top: "50%", width: 4, height: 14,
            background: accent, borderRadius: 2,
            transform: `rotate(${i * 45}deg) translate(-50%, -${size / 2 + 20}px)`,
          }} />
        ))}
      </div>
      <div style={{ width: size, height: size, borderRadius: "50%", background: accent,
                    boxShadow: `0 0 24px ${accent}90` }} />
    </div>
  );
};

const RainDrop: React.FC<{ x: number; delay: number; frame: number; accent: string }> = ({ x, delay, frame, accent }) => {
  const loop = (frame - delay + 600) % 24;
  const y = interpolate(loop, [0, 24], [0, 46]);
  const op = interpolate(loop, [0, 6, 20, 24], [0, 1, 1, 0]);
  return (
    <div style={{ position: "absolute", left: x, top: 118 + y, width: 4, height: 14, borderRadius: 2,
                  background: accent, opacity: op }} />
  );
};

// Ícone de clima (sol / nublado / chuva) animado, estilo native-ui, sem foto de fundo.
// Usado quando o roteiro usa uma metáfora de clima ou tempo (ex: "nem todo dia é dia de
// sol", "prepare-se pra qualquer cenário").
export const WeatherScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const type = scene.weatherType || "sunny";

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iconOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iconScale = interpolate(frame, [0, 14], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tempOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28 }}>
      {scene.weatherLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.weatherLabel}
        </div>
      )}

      <div style={{ position: "relative", width: ICON, height: ICON, opacity: iconOp, transform: `scale(${iconScale})` }}>
        {type === "sunny" && <Sun accent={accent} frame={frame} />}
        {type === "cloudy" && (<><Sun accent={accent} frame={frame} small /><Cloud /></>)}
        {type === "rainy" && (
          <>
            <Cloud color="rgba(200,205,220,0.9)" />
            {[30, 60, 90, 115].map((x, i) => (
              <RainDrop key={i} x={x} delay={i * 6} frame={frame} accent={accent} />
            ))}
          </>
        )}
      </div>

      {scene.weatherTemp && (
        <div style={{ opacity: tempOp, fontSize: 64, fontWeight: 900, color: "#fff",
                      fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
          {scene.weatherTemp}
        </div>
      )}

      {scene.weatherNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.weatherNote}
        </div>
      )}
    </div>
  );
};
