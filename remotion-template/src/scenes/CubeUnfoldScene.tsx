import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxTick } from "../utils/soundSynth";

const FACE_SIZE = 72;
const UNFOLD_START = 20;
const UNFOLD_END = 70;

// posições finais em cruz 2D (net de cubo)
const NET_SLOTS = [
  { dx: 0, dy: 0 },
  { dx: 0, dy: -86 },
  { dx: 0, dy: 86 },
  { dx: -86, dy: 0 },
  { dx: 86, dy: 0 },
  { dx: 172, dy: 0 },
];

// posições aproximadas enquanto as faces ainda formam o cubo isométrico fechado
const CUBE_START = [
  { dx: 0, dy: 0, rot: 0 },
  { dx: 0, dy: -18, rot: -8 },
  { dx: 8, dy: 10, rot: 4 },
  { dx: -24, dy: 6, rot: -25 },
  { dx: 24, dy: 6, rot: 25 },
  { dx: 0, dy: 0, rot: 0 },
];

// Cubo isométrico que se abre desmontando as 6 faces numa cruz plana, revelando um
// ícone/texto em cada face conforme elas se assentam. Use pra MÚLTIPLAS FACETAS de um
// mesmo assunto (ex: "6 formas de economizar").
export const CubeUnfoldScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const faces = (scene.cubeFaces || []).slice(0, 6);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(frame, [UNFOLD_START, UNFOLD_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOp = interpolate(t, [0.85, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [UNFOLD_END + 14, UNFOLD_END + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const count = Math.max(faces.length, 3);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.cubeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cubeLabel}
        </div>
      )}

      <svg width={360} height={320} viewBox="0 0 360 320">
        <g transform="translate(90, 160)">
          {Array.from({ length: count }).map((_, i) => {
            const start = CUBE_START[i] || CUBE_START[0];
            const end = NET_SLOTS[i] || NET_SLOTS[0];
            const dx = interpolate(t, [0, 1], [start.dx, end.dx]);
            const dy = interpolate(t, [0, 1], [start.dy, end.dy]);
            const rot = interpolate(t, [0, 1], [start.rot, 0]);
            const face = faces[i];

            return (
              <g key={i} transform={`translate(${dx}, ${dy}) rotate(${rot})`}>
                <rect x={-FACE_SIZE / 2} y={-FACE_SIZE / 2} width={FACE_SIZE} height={FACE_SIZE} rx={8}
                      fill={i === 0 ? accent : "var(--ink-12)"}
                      stroke={accent} strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 10px ${accent}50)` }} />
                {face?.label && (
                  <text x={0} y={6} textAnchor="middle" fontSize={16} fontWeight={800}
                        fill={i === 0 ? "#1a1a1a" : "var(--ink)"} opacity={textOp}>
                    {face.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {scene.cubeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.cubeNote}
        </div>
      )}

      <Sequence from={UNFOLD_START} durationInFrames={UNFOLD_END - UNFOLD_START} layout="none">
        <Audio src={sfxWhoosh((UNFOLD_END - UNFOLD_START) / 30)} volume={0.13} />
      </Sequence>
      {Array.from({ length: count }).map((_, i) => (
        <Sequence key={i} from={Math.round(UNFOLD_START + (i / Math.max(1, count - 1)) * (UNFOLD_END - UNFOLD_START))}
                  durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.13} />
        </Sequence>
      ))}
    </div>
  );
};
