import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
const HOLD_FRAMES = 10; // segura parado no valor inicial antes de começar a contar

function parseMMSS(raw: string | undefined, fallback: number): number {
  const m = (raw || "").match(/(\d+):(\d{1,2})/);
  if (!m) return fallback;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

// Cronômetro regressivo (estilo native-ui) — anel se esvaziando enquanto os dígitos
// contam de timerFrom até timerTo, sem foto de fundo. Usado quando o roteiro menciona
// um tempo/prazo curto e concreto (ex: "separe 10 minutos", "em 30 segundos").
export const TimerScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fromSec = parseMMSS(scene.timerFrom, 120);
  const toSec = Math.min(fromSec, parseMMSS(scene.timerTo, 0));
  const total = Math.round(scene.duration * fps);
  const countFrames = Math.max(1, total - HOLD_FRAMES);

  const p = interpolate(frame, [HOLD_FRAMES, countFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const current = interpolate(p, [0, 1], [fromSec, toSec]);
  const ringFrac = fromSec > 0 ? current / fromSec : 0;
  const dashoffset = CIRC * (1 - ringFrac);

  const ringOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36 }}>
      {scene.timerLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.timerLabel}
        </div>
      )}

      <div style={{ position: "relative", width: SIZE, height: SIZE, opacity: ringOp }}>
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
            stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
            stroke={accent} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={dashoffset}
            style={{ filter: `drop-shadow(0 0 14px ${accent}90)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 78, fontWeight: 900, color: "#fff", letterSpacing: -2,
                        fontVariantNumeric: "tabular-nums", textShadow: SOFT_TEXT_SHADOW }}>
            {formatMMSS(current)}
          </div>
        </div>
      </div>

      {scene.timerNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.timerNote}
        </div>
      )}
    </div>
  );
};
