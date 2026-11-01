import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const CARD_SIZE = 300;
const PIN_LAND_FRAME = 10;
const PIN_PATH =
  "M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 7 12s1 .01 1 0c0 0 7-6.75 7-12 0-4.42-3.58-8-8-8zm0 10.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z";

// Variante 1 do mapa: globo com linhas de latitude/longitude girando lentamente, em vez
// da grade plana — mesmo pin/radar por cima, só a base visual muda (ver pickVariant em
// MotionReel.tsx). Cobre a ideia de "GlobePinScene" sem duplicar a lógica da MapScene.
const GlobeGrid: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const spin = (frame / fps) * 14; // graus/seg
  const lons = [0, 30, 60, 90, 120, 150];
  return (
    <svg width={CARD_SIZE} height={CARD_SIZE} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="globeShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#globeShade)" stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
      {[-60, -30, 0, 30, 60].map((lat) => {
        const r = Math.sqrt(Math.max(0, 98 * 98 - (lat * 0.95) ** 2));
        return (
          <ellipse key={lat} cx="100" cy={100 - lat * 0.95} rx={r} ry={6}
                   fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
        );
      })}
      {lons.map((lon) => {
        const angle = ((lon + spin) % 180) - 90;
        const rx = Math.abs(Math.cos((angle * Math.PI) / 180)) * 98;
        return (
          <ellipse key={lon} cx="100" cy="100" rx={rx} ry="98"
                   fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
        );
      })}
    </svg>
  );
};

// Mapa estilizado (grade de pontos, estilo native-ui) com um pin caindo e quicando no
// alvo, radar pulsando embaixo, sem foto de fundo real. Usado quando o roteiro menciona
// um LOCAL ou abrangência geográfica (ex: "em qualquer lugar do Brasil", "perto de você").
export const MapScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dropP = spring({ fps, frame, config: { damping: 9, stiffness: 140 } });
  const pinY = interpolate(dropP, [0, 1], [-200, 0]);

  const pingElapsed = Math.max(0, (frame - PIN_LAND_FRAME) % 60);
  const pingScale = interpolate(pingElapsed, [0, 60], [0.3, 2.4]);
  const pingOp = interpolate(pingElapsed, [0, 60], [0.55, 0]);
  const pingVisible = frame >= PIN_LAND_FRAME;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32 }}>
      {scene.mapLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.mapLabel}
        </div>
      )}

      <div style={{
        position: "relative", width: CARD_SIZE, height: CARD_SIZE, borderRadius: variant % 2 === 1 ? "50%" : 28,
        border: "1px solid rgba(255,255,255,0.15)", overflow: "hidden", opacity: cardOp,
        backgroundColor: "rgba(255,255,255,0.03)",
        backgroundImage: variant % 2 === 1 ? undefined :
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 38px)," +
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 38px)",
      }}>
        {variant % 2 === 1 && <GlobeGrid frame={frame} fps={fps} />}
        {pingVisible && (
          <div style={{
            position: "absolute", left: "50%", top: "50%", width: 70, height: 70,
            borderRadius: "50%", border: `2px solid ${accent}`,
            transform: `translate(-50%, -50%) scale(${pingScale})`, opacity: pingOp,
          }} />
        )}

        <div style={{
          position: "absolute", left: "50%", top: "50%", width: 54, height: 54,
          transform: `translate(-50%, calc(-100% + ${pinY}px))`, transformOrigin: "50% 100%",
          filter: `drop-shadow(0 6px 10px rgba(0,0,0,0.5))`,
        }}>
          <svg width="54" height="54" viewBox="0 0 24 24">
            <path d={PIN_PATH} fill={accent} stroke="#0b0b10" strokeWidth={0.6} />
          </svg>
        </div>

        {scene.mapPinLabel && (
          <div style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, 14px)",
            fontSize: 20, fontWeight: 800, color: "#fff", textTransform: "uppercase",
            letterSpacing: 0.5, textShadow: SOFT_TEXT_SHADOW, whiteSpace: "nowrap",
            opacity: labelOp,
          }}>
            {scene.mapPinLabel}
          </div>
        )}
      </div>

      {scene.mapNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.mapNote}
        </div>
      )}
    </div>
  );
};
