import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const SIZE = 320;
const ROD_Y = [90, 160, 230];
const BEADS_PER_ROD = 5;
const ROD_START_FRAME = [10, 45, 80];
const BEAD_TRAVEL = 24;

// Ábaco com contas deslizando em 3 hastes (unidades, dezenas, centenas), somando em
// sequência. Use pra CÁLCULO, soma visual ou matemática antiga vs. moderna.
export const AbacusBeadsScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastRodEnd = ROD_START_FRAME[2] + BEAD_TRAVEL + BEADS_PER_ROD * 4;
  const valueOp = interpolate(frame, [lastRodEnd, lastRodEnd + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [lastRodEnd + 14, lastRodEnd + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {ROD_START_FRAME.map((rodStart, rodIdx) =>
        Array.from({ length: BEADS_PER_ROD }).map((_, beadIdx) => (
          <Sequence key={`${rodIdx}-${beadIdx}`} from={rodStart + beadIdx * 4 + BEAD_TRAVEL} durationInFrames={4} layout="none">
            <Audio src={sfxTick()} volume={0.1} />
          </Sequence>
        ))
      )}
      {scene.abacusLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.abacusLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <rect x={20} y={40} width={SIZE - 40} height={260} fill="none" stroke="#6b4a2b" strokeWidth={6} rx={10} />
        {ROD_Y.map((y, rodIdx) => {
          const rodStart = ROD_START_FRAME[rodIdx];
          return (
            <g key={rodIdx}>
              <line x1={30} y1={y} x2={SIZE - 30} y2={y} stroke="#8a6238" strokeWidth={4} />
              {Array.from({ length: BEADS_PER_ROD }).map((_, beadIdx) => {
                const beadStart = rodStart + beadIdx * 4;
                const t = interpolate(frame, [beadStart, beadStart + BEAD_TRAVEL], [0, 1], {
                  extrapolateLeft: "clamp", extrapolateRight: "clamp",
                });
                const startX = 40 + beadIdx * 36;
                const endX = SIZE - 55 - (BEADS_PER_ROD - 1 - beadIdx) * 36;
                const x = startX + (endX - startX) * t;
                const clickScale = t > 0.92 ? 1.15 : 1;
                return (
                  <circle key={beadIdx} cx={x} cy={y} r={14 * clickScale} fill={accent}
                          opacity={0.9} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
                );
              })}
            </g>
          );
        })}
      </svg>

      {scene.abacusValue && (
        <div style={{ opacity: valueOp, fontSize: 56, fontWeight: 800, color: "var(--ink)",
                      textAlign: "center", textShadow: SOFT_TEXT_SHADOW }}>
          {scene.abacusValue}
        </div>
      )}

      {scene.abacusNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.abacusNote}
        </div>
      )}
    </div>
  );
};
