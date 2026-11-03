import React from "react";
import { useCurrentFrame, interpolate, Easing, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxBeep } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 140;
const SETTLE_FRAME = 70;

const DIR_ANGLES: Record<string, number> = {
  NORTE: 0, NORDESTE: 45, LESTE: 90, SUDESTE: 135,
  SUL: 180, SUDOESTE: 225, OESTE: 270, NOROESTE: 315,
};

// Rosa dos ventos onde a agulha gira desorientada várias voltas rápidas antes de
// desacelerar e travar numa direção final. Use pra ORIENTAÇÃO, propósito ou
// decisão de rumo.
export const CompassNeedleScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const direction = (scene.compassDirection || "NORTE").toUpperCase();
  const finalAngle = DIR_ANGLES[direction] ?? 0;
  const totalRotation = 3 * 360 + finalAngle;

  const rotation = interpolate(frame, [0, SETTLE_FRAME], [0, totalRotation], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });

  const dirLabelOp = interpolate(frame, [SETTLE_FRAME, SETTLE_FRAME + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [SETTLE_FRAME + 12, SETTLE_FRAME + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const marks = Array.from({ length: 12 }).map((_, i) => {
    const a = (360 / 12) * i;
    const rad = ((a - 90) * Math.PI) / 180;
    return { x1: CX + (R - 14) * Math.cos(rad), y1: CY + (R - 14) * Math.sin(rad), x2: CX + R * Math.cos(rad), y2: CY + R * Math.sin(rad) };
  });

  const cardinal = [
    { label: "N", a: 0 }, { label: "L", a: 90 }, { label: "S", a: 180 }, { label: "O", a: 270 },
  ].map((c) => {
    const rad = ((c.a - 90) * Math.PI) / 180;
    return { ...c, x: CX + (R - 32) * Math.cos(rad), y: CY + (R - 32) * Math.sin(rad) };
  });

  const needleRad = ((rotation - 90) * Math.PI) / 180;
  const needleX = CX + R * 0.8 * Math.cos(needleRad);
  const needleY = CY + R * 0.8 * Math.sin(needleRad);
  const tailX = CX - R * 0.5 * Math.cos(needleRad);
  const tailY = CY - R * 0.5 * Math.sin(needleRad);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={30} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.1} />
      </Sequence>
      <Sequence from={SETTLE_FRAME} durationInFrames={6} layout="none">
        <Audio src={sfxBeep()} volume={0.16} />
      </Sequence>
      {scene.compassLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.compassLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CY} r={R} fill="var(--ink-04)" stroke="var(--ink-3)" strokeWidth={2} />
        {marks.map((m, i) => (
          <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="var(--ink-35)" strokeWidth={2} />
        ))}
        {cardinal.map((c) => (
          <text key={c.label} x={c.x} y={c.y + 6} fill="var(--ink)" fontSize={18} fontWeight={700} textAnchor="middle">
            {c.label}
          </text>
        ))}

        <line x1={tailX} y1={tailY} x2={needleX} y2={needleY} stroke="#9a9aa5" strokeWidth={5} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke={accent} strokeWidth={5} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
        <circle cx={CX} cy={CY} r={7} fill="var(--ink)" />
      </svg>

      {scene.compassDirection && (
        <div style={{ opacity: dirLabelOp, fontSize: 30, fontWeight: 700, color: "var(--ink)", letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {direction}
        </div>
      )}

      {scene.compassNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.compassNote}
        </div>
      )}
    </div>
  );
};
