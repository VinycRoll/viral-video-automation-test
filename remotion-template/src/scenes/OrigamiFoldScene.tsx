import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

const SIZE = 320;
const CENTER = SIZE / 2;
const HALF = 90;
const FOLD_STARTS = [10, 28, 46, 64];
const FOLD_LEN = 16;

// Folha quadrada plana cujas pontas se dobram sequencialmente até formar a silhueta de
// um objeto. Use pra TRANSFORMAÇÃO progressiva de algo simples em algo elaborado.
export const OrigamiFoldScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const corners = [
    { x: CENTER - HALF, y: CENTER - HALF },
    { x: CENTER + HALF, y: CENTER - HALF },
    { x: CENTER + HALF, y: CENTER + HALF },
    { x: CENTER - HALF, y: CENTER + HALF },
  ];

  const folds = corners.map((c, i) => {
    const start = FOLD_STARTS[i];
    const t = interpolate(frame, [start, start + FOLD_LEN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const x = c.x + (CENTER - c.x) * t * 0.7;
    const y = c.y + (CENTER - c.y) * t * 0.7;
    const skew = t * 25;
    return { x, y, t, skew };
  });

  const lastEnd = FOLD_STARTS[3] + FOLD_LEN;
  const titleOp = interpolate(frame, [lastEnd + 6, lastEnd + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [lastEnd + 24, lastEnd + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {FOLD_STARTS.map((start, i) => (
        <Sequence key={i} from={start} durationInFrames={10} layout="none">
          <Audio src={sfxWhoosh(0.15)} volume={0.12} />
        </Sequence>
      ))}
      {scene.origamiLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.origamiLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <polygon points={folds.map((f) => `${f.x},${f.y}`).join(" ")} fill="#f2ede0"
                 stroke={accent} strokeWidth={3} opacity={0.95}
                 style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
        {folds.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={5} fill={accent} opacity={f.t > 0 && f.t < 1 ? 1 : 0} />
        ))}
        {scene.origamiTitle && (
          <text x={CENTER} y={CENTER + 6} fill="#333" fontSize={18} fontWeight={800}
                textAnchor="middle" opacity={titleOp}>
            {scene.origamiTitle}
          </text>
        )}
      </svg>

      {scene.origamiNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.origamiNote}
        </div>
      )}
    </div>
  );
};
