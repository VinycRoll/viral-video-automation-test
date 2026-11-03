import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxImpact, sfxExplosion } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const STAGE_H = 240;
const PLATE_H = 20;
const PLATE_W = 260;
const OBJECT_W = 140;
const OBJECT_H = 90;
const SQUEEZE_START = 20;
const SQUEEZE_END = 70;
const GAP_AT_PEAK = 14; // px que sobram entre as placas e o objeto no pico

// Duas placas que se fecham sobre um objeto central, comprimindo-o verticalmente até
// quase se tocarem, com rachaduras aparecendo no pico — use pra pressão extrema
// (profundidade, prazo, dívida) esmagando algo, diferente de DominoEffectScene (cadeia linear).
export const PressureCrushScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const squeezeT = interpolate(frame, [SQUEEZE_START, SQUEEZE_END], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const halfGap = (STAGE_H - PLATE_H) / 2;
  const travel = halfGap - OBJECT_H / 2 - GAP_AT_PEAK;
  const plateOffset = squeezeT * travel;
  const scaleY = interpolate(squeezeT, [0, 1], [1, 0.4]);
  const crackOp = interpolate(squeezeT, [0.85, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={SQUEEZE_START} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      <Sequence from={SQUEEZE_END} durationInFrames={20} layout="none">
        <Audio src={sfxExplosion()} volume={0.2} />
      </Sequence>
      {scene.pressureLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pressureLabel}
        </div>
      )}

      <div style={{ opacity: bodyOp, position: "relative", width: PLATE_W, height: STAGE_H }}>
        <div style={{
          position: "absolute", top: plateOffset, left: 0, width: PLATE_W, height: PLATE_H,
          background: accent, borderRadius: 4, boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
        }} />
        <div style={{
          position: "absolute", bottom: plateOffset, left: 0, width: PLATE_W, height: PLATE_H,
          background: accent, borderRadius: 4, boxShadow: "0 -10px 20px rgba(0,0,0,0.4)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", width: OBJECT_W, height: OBJECT_H,
          transform: `translate(-50%, -50%) scaleY(${scaleY})`, background: "var(--ink-85)",
          borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={OBJECT_W} height={OBJECT_H} style={{ position: "absolute", opacity: crackOp }}>
            <path d="M30,10 L60,45 L45,50 L75,80" fill="none" stroke="#222" strokeWidth={2} />
            <path d="M100,15 L80,40 L95,55 L70,75" fill="none" stroke="#222" strokeWidth={2} />
          </svg>
        </div>
      </div>
      {scene.pressureTitle && (
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", textAlign: "center", textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pressureTitle}
        </div>
      )}

      {scene.pressureNote && (
        <div style={{ opacity: interpolate(frame, [SQUEEZE_END, SQUEEZE_END + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.pressureNote}
        </div>
      )}
    </div>
  );
};
