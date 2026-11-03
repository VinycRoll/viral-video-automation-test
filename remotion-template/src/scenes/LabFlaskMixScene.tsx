import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBubble, sfxSuccess } from "../utils/soundSynth";

const TILT_START = 10;
const TILT_END = 40;
const BEAKER_W = 140;
const BEAKER_H = 160;

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bch = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

// Dois tubos de ensaio tombam e despejam líquido num béquer central, que mistura e vira
// uma terceira cor — use pra ilustrar combinação de dois fatores gerando um resultado,
// diferente de "chainreaction" (multiplicação de um único elemento).
export const LabFlaskMixScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = interpolate(frame, [TILT_START, TILT_END], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pourAmt = interpolate(frame, [TILT_START, TILT_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const level = interpolate(pourAmt, [0, 1], [8, BEAKER_H - 14]);
  const mixColor = mixHex("var(--ink)", accent, pourAmt);
  const resultOp = interpolate(frame, [TILT_END, TILT_END + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [TILT_END + 30, TILT_END + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {[0, 1, 2].map((k) => (
        <Sequence key={k} from={Math.round(TILT_START + (k * (TILT_END - TILT_START)) / 3)} durationInFrames={6} layout="none">
          <Audio src={sfxBubble()} volume={0.14} />
        </Sequence>
      ))}
      <Sequence from={TILT_END} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>

      {scene.labLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.labLabel}
        </div>
      )}

      <svg width={560} height={300} viewBox="0 0 560 300">
        <g transform={`translate(80, 10) rotate(${tilt} 20 20)`}>
          <rect x={0} y={0} width={40} height={90} rx={8} fill="none" stroke="var(--ink-5)" strokeWidth={3} />
          <rect x={3} y={30} width={34} height={56} rx={6} fill="var(--ink)" opacity={0.85} />
        </g>
        {scene.labLeftLabel && (
          <text x={100} y={120} fill="var(--ink)" fontSize={20} textAnchor="middle" fontFamily={SERIF_FONT}>{scene.labLeftLabel}</text>
        )}

        <g transform={`translate(440, 10) rotate(${-tilt} 20 20)`}>
          <rect x={0} y={0} width={40} height={90} rx={8} fill="none" stroke="var(--ink-5)" strokeWidth={3} />
          <rect x={3} y={30} width={34} height={56} rx={6} fill={accent} opacity={0.85} />
        </g>
        {scene.labRightLabel && (
          <text x={460} y={120} fill="var(--ink)" fontSize={20} textAnchor="middle" fontFamily={SERIF_FONT}>{scene.labRightLabel}</text>
        )}

        <g transform={`translate(${280 - BEAKER_W / 2}, 140)`}>
          <rect x={0} y={0} width={BEAKER_W} height={BEAKER_H} rx={10} fill="none" stroke="var(--ink-5)" strokeWidth={3} />
          <rect x={4} y={BEAKER_H - level} width={BEAKER_W - 8} height={level - 4} rx={6} fill={mixColor} opacity={0.9} />
          {pourAmt >= 1 && [0, 1, 2].map((b) => {
            const bubbleY = BEAKER_H - 10 - ((frame * (3 + b)) % (level - 10 || 1));
            return <circle key={b} cx={30 + b * 35} cy={bubbleY} r={4} fill="var(--ink-6)" />;
          })}
        </g>
      </svg>

      {scene.labResultLabel && (
        <div style={{ opacity: resultOp, fontSize: 30, fontWeight: 800, color: accent, textAlign: "center",
                      fontFamily: SERIF_FONT, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.labResultLabel}
        </div>
      )}

      {scene.labNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.labNote}
        </div>
      )}
    </div>
  );
};
