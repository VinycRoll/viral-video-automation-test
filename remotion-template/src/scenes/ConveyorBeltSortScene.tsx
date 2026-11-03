import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxBeep, sfxAlert } from "../utils/soundSynth";

const VIEW_W = 360;
const BELT_Y = 190;
const SPEED = 3.2; // px por frame
const SPAWN_INTERVAL = 20;
const ARM_X = VIEW_W / 2;
const ITEM_COUNT = 9;

// Esteira horizontal trazendo itens em fila onde um braço mecânico separa defeituosos
// (vermelho) dos aprovados (verde), sem foto de fundo. Use pra SELEÇÃO, triagem ou
// controle de qualidade.
export const ConveyorBeltSortScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [ITEM_COUNT * SPAWN_INTERVAL * 0.5, ITEM_COUNT * SPAWN_INTERVAL * 0.5 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // listras diagonais deslizando continuamente pra simular a esteira em movimento
  const stripeOffset = (frame * 6) % 40;

  // janela de ativação do braço (próxima vez que um item defeituoso cruza o braço)
  const defectivePeriod = 3 * SPAWN_INTERVAL;
  const firstDefectiveCross = 2 * SPAWN_INTERVAL + ARM_X / SPEED;
  const armPhase = ((frame - firstDefectiveCross) % defectivePeriod + defectivePeriod) % defectivePeriod;
  const armDown = interpolate(armPhase, [0, 8, 18], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const items = Array.from({ length: ITEM_COUNT }).map((_, i) => {
    const spawnFrame = i * SPAWN_INTERVAL;
    const age = frame - spawnFrame;
    const defective = i % 3 === 2;
    const crossFrame = spawnFrame + ARM_X / SPEED;
    const x = -20 + age * SPEED;
    let y = BELT_Y;
    if (defective && frame >= crossFrame) {
      const fallT = interpolate(frame, [crossFrame, crossFrame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      y = BELT_Y + fallT * fallT * 160;
    }
    return { x, y, age, defective };
  }).filter((it) => it.age >= 0 && it.x < VIEW_W + 30 && it.y < 340);

  const beltTickFrames = Array.from({ length: 13 }).map((_, i) => i * 8);
  const sortCrossings = Array.from({ length: ITEM_COUNT }).map((_, i) => ({
    frame: Math.round(i * SPAWN_INTERVAL + ARM_X / SPEED),
    defective: i % 3 === 2,
  }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.conveyorLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.conveyorLabel}
        </div>
      )}

      <svg width={VIEW_W} height={300} viewBox={`0 0 ${VIEW_W} 300`}>
        {/* braço mecânico */}
        <line x1={ARM_X} y1={30} x2={ARM_X} y2={60 + armDown * 60} stroke="var(--ink-6)" strokeWidth={6} />
        <rect x={ARM_X - 18} y={55 + armDown * 60} width={36} height={14} rx={3} fill={accent} />

        {/* esteira */}
        <rect x={0} y={BELT_Y} width={VIEW_W} height={26} fill="#2b2b33" />
        <g clipPath="none">
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={i * 40 - stripeOffset} y={BELT_Y} width={18} height={26} fill="var(--ink-08)" transform={`skewX(-20)`} />
          ))}
        </g>
        <rect x={0} y={BELT_Y + 26} width={VIEW_W} height={8} fill="#1a1a1f" />

        {items.map((it, i) => (
          <rect key={i} x={it.x - 14} y={it.y - 28} width={28} height={28} rx={4}
                fill={it.defective ? "#e2483f" : "#3ecf6b"}
                style={{ filter: `drop-shadow(0 0 8px ${it.defective ? "#e2483f" : "#3ecf6b"}70)` }} />
        ))}
      </svg>

      {scene.conveyorNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.conveyorNote}
        </div>
      )}

      {beltTickFrames.map((f) => (
        <Sequence key={`belt${f}`} from={f} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.09} />
        </Sequence>
      ))}
      {sortCrossings.map((c, i) => (
        <Sequence key={`sort${i}`} from={c.frame} durationInFrames={c.defective ? 10 : 6} layout="none">
          <Audio src={c.defective ? sfxAlert() : sfxBeep()} volume={c.defective ? 0.2 : 0.15} />
        </Sequence>
      ))}
    </div>
  );
};
