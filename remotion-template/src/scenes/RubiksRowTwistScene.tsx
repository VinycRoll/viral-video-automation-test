import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxSuccess } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const GRID = 3;
const CELL = 70;
const GAP = 6;
const ORIGIN = (SIZE - (CELL * GRID + GAP * (GRID - 1))) / 2;

const SCRAMBLED = [
  "#e74c3c", "#f1c40f", "#2ecc71",
  "#9b59b6", "#3498db", "#e67e22",
  "#1abc9c", "#ecf0f1", "#e74c3c",
];
const SOLVED_ROW1 = ["#2ecc71", "#2ecc71", "#2ecc71"];
const ROW_SLIDE_END = 40;
const COL_SLIDE_END = 80;

// Grade 3x3 de quadrados coloridos desalinhados onde linha e coluna deslizam até encaixar
// as cores. Use pra ORGANIZAÇÃO, resolver um problema complexo em poucos movimentos.
export const RubiksRowTwistScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rowT = interpolate(frame, [10, ROW_SLIDE_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const colT = interpolate(frame, [ROW_SLIDE_END + 10, COL_SLIDE_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [COL_SLIDE_END + 12, COL_SLIDE_END + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const colors = SCRAMBLED.map((c, i) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    const isRow1 = row === 1;
    const isCol1 = col === 1;
    let color = c;
    if (colT >= 1 && isCol1) color = SOLVED_ROW1[0];
    else if (rowT >= 1 && isRow1) color = SOLVED_ROW1[0];
    return { row, col, color, isRow1, isCol1 };
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={10} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.1} />
      </Sequence>
      <Sequence from={ROW_SLIDE_END + 10} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.1} />
      </Sequence>
      <Sequence from={COL_SLIDE_END} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.18} />
      </Sequence>
      {scene.rubiksLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.rubiksLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {colors.map((c, i) => {
          const baseX = ORIGIN + c.col * (CELL + GAP);
          const baseY = ORIGIN + c.row * (CELL + GAP);
          const offsetX = c.isRow1 ? rowT * 14 * Math.sin(frame / 3) * (1 - rowT) : 0;
          const offsetY = c.isCol1 ? colT * 14 * Math.sin(frame / 3) * (1 - colT) : 0;
          return (
            <rect key={i} x={baseX + offsetX} y={baseY + offsetY} width={CELL} height={CELL} rx={8}
                  fill={c.color} opacity={0.95} />
          );
        })}
      </svg>

      {scene.rubiksNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.rubiksNote}
        </div>
      )}
    </div>
  );
};
