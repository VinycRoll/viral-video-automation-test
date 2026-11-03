import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxImpact } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const GRID = 5;
const CELL = 56;
const BOARD = GRID * CELL;
const PATH: [number, number][] = [[0, 0], [0, 2], [2, 2]];
const IMPACT_FRAME = 70;

const cellCenter = (col: number, row: number): [number, number] => [col * CELL + CELL / 2, row * CELL + CELL / 2];

// Tabuleiro minimalista onde uma peça avança em L através de casas e derruba
// outra peça com um pequeno impacto. Use pra ESTRATÉGIA, planejamento ou decisões
// calculadas (vencer um adversário, prever um movimento).
export const ChessStrategyScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const [p0x, p0y] = cellCenter(...PATH[0]);
  const [p1x, p1y] = cellCenter(...PATH[1]);
  const [p2x, p2y] = cellCenter(...PATH[2]);

  const pieceX = interpolate(frame, [0, 35, IMPACT_FRAME], [p0x, p1x, p2x], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pieceY = interpolate(frame, [0, 35, IMPACT_FRAME], [p0y, p1y, p2y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const flash = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 3, IMPACT_FRAME + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeAmt = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 8], [6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeX = shakeAmt * Math.sin(frame * 5);
  const opponentOp = interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const moveOp = interpolate(frame, [IMPACT_FRAME + 12, IMPACT_FRAME + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={10} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.12} />
      </Sequence>
      <Sequence from={IMPACT_FRAME} durationInFrames={13} layout="none">
        <Audio src={sfxImpact()} volume={0.2} />
      </Sequence>
      {scene.chessLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chessLabel}
        </div>
      )}

      <svg width={BOARD} height={BOARD} viewBox={`0 0 ${BOARD} ${BOARD}`} style={{ transform: `translateX(${shakeX}px)` }}>
        {Array.from({ length: GRID }).map((_, row) =>
          Array.from({ length: GRID }).map((_, col) => (
            <rect key={`${row}-${col}`} x={col * CELL} y={row * CELL} width={CELL} height={CELL}
                  fill={(row + col) % 2 === 0 ? "#2b2b3a" : "#3a3a4d"} />
          ))
        )}

        <circle cx={p2x} cy={p2y} r={18} fill="#8f8f9a" opacity={opponentOp}
                style={{ filter: opponentOp > 0.5 ? "none" : `drop-shadow(0 0 10px var(--ink))` }} />

        <circle cx={pieceX} cy={pieceY} r={18} fill={accent} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />

        <rect x={0} y={0} width={BOARD} height={BOARD} fill="var(--ink)" opacity={flash * 0.5} />

        {scene.chessMoveLabel && (
          <text x={p2x} y={p2y - 28} fill="var(--ink)" fontSize={15} fontWeight={700} textAnchor="middle" opacity={moveOp}>
            {scene.chessMoveLabel}
          </text>
        )}
      </svg>

      {scene.chessNote && (
        <div style={{ opacity: moveOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chessNote}
        </div>
      )}
    </div>
  );
};
