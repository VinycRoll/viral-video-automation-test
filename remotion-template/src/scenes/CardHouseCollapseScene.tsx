import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxExplosion } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const BUILD_FRAMES_PER_FLOOR = 12;
const HOLD_FRAMES = 30;
const COLLAPSE_FRAMES = 40;
const FLOOR_HEIGHT = 52;
const BASE_Y = 300;

// Torre de cartas que sobe andar por andar em formato de pirâmide e desmonta com um
// sopro lateral, tombando em cadeia pra fora. Use pra algo construído sobre base frágil
// (esquema, bolha, castelo de cartas financeiro).
export const CardHouseCollapseScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const floors = scene.cardhouseFloors || 4;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buildEnd = floors * BUILD_FRAMES_PER_FLOOR;
  const collapseStart = buildEnd + HOLD_FRAMES;
  const noteOp = interpolate(
    frame,
    [collapseStart + COLLAPSE_FRAMES + 10, collapseStart + COLLAPSE_FRAMES + 22],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cards: { x: number; y: number; floorIdx: number; cardIdx: number }[] = [];
  for (let f = 0; f < floors; f++) {
    const count = floors - f; // andar mais alto tem menos cartas (pirâmide)
    const floorY = BASE_Y - f * FLOOR_HEIGHT;
    const totalWidth = count * 44;
    for (let c = 0; c < count; c++) {
      const cx = 160 - totalWidth / 2 + c * 44 + 22;
      cards.push({ x: cx, y: floorY, floorIdx: f, cardIdx: c });
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {Array.from({ length: floors }).map((_, f) => (
        <Sequence key={f} from={f * BUILD_FRAMES_PER_FLOOR} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={collapseStart} durationInFrames={20} layout="none">
        <Audio src={sfxExplosion()} volume={0.2} />
      </Sequence>
      {scene.cardhouseLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cardhouseLabel}
        </div>
      )}

      <svg width={320} height={340} viewBox="0 0 320 340">
        {cards.map((card, i) => {
          const floorAppearFrame = card.floorIdx * BUILD_FRAMES_PER_FLOOR;
          const appearOp = interpolate(frame, [floorAppearFrame, floorAppearFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fallStart = collapseStart + card.floorIdx * 3;
          const t = interpolate(frame, [fallStart, fallStart + COLLAPSE_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const tumbleRot = t * (60 + (card.cardIdx % 3) * 8);
          const dx = t * (120 + card.floorIdx * 10);
          const dy = t * t * 240;

          return (
            <g key={i} opacity={appearOp} transform={`translate(${dx}, ${dy}) rotate(${tumbleRot}, ${card.x}, ${card.y})`}>
              <rect x={card.x - 18} y={card.y - 48} width={8} height={50} fill={accent} rx={2}
                    transform={`rotate(-18, ${card.x - 14}, ${card.y})`}
                    style={{ filter: `drop-shadow(0 0 6px ${accent}60)` }} />
              <rect x={card.x + 10} y={card.y - 48} width={8} height={50} fill={accent} rx={2}
                    transform={`rotate(18, ${card.x + 14}, ${card.y})`}
                    style={{ filter: `drop-shadow(0 0 6px ${accent}60)` }} />
            </g>
          );
        })}
      </svg>

      {scene.cardhouseNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cardhouseNote}
        </div>
      )}
    </div>
  );
};
