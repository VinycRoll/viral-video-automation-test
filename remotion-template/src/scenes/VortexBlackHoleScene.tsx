import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const START_RADIUS = 155;
const ITEM_GAP = 22;
const SPIRAL_DURATION = 85;

// Espiral central escura com efeito gravitacional puxando itens das bordas da
// tela em direção ao núcleo, girando e encolhendo até desaparecerem. Use pra
// descrever algo que "suga" recursos/atenção/tempo (dívida, vício, distração).
export const VortexBlackHoleScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const items = scene.vortexItems || [];

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08;

  const cycleLen = Math.max(items.length, 1) * ITEM_GAP + SPIRAL_DURATION + 20;
  const loopFrame = frame % cycleLen;

  const noteOp = interpolate(frame, [cycleLen, cycleLen + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.vortexLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.vortexLabel}
        </div>
      )}

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={CX} cy={CY} r={70 * pulse} fill="none" stroke={accent} strokeWidth={2} opacity={0.25}
                style={{ filter: `drop-shadow(0 0 14px ${accent})` }} />
        <circle cx={CX} cy={CY} r={48 * pulse} fill="none" stroke={accent} strokeWidth={2.5} opacity={0.45}
                style={{ filter: `drop-shadow(0 0 16px ${accent})` }} />
        <circle cx={CX} cy={CY} r={26} fill="#05030a" stroke={accent} strokeWidth={1.5}
                style={{ filter: `drop-shadow(0 0 20px ${accent})` }} />

        {items.map((it, i) => {
          const startFrame = i * ITEM_GAP;
          const t = Math.min(Math.max(loopFrame - startFrame, 0), SPIRAL_DURATION);
          const p = t / SPIRAL_DURATION;
          const angle0 = (360 / items.length) * i;
          const angle = angle0 + p * 640;
          const radius = interpolate(p, [0, 1], [START_RADIUS, 4]);
          const rad = (angle * Math.PI) / 180;
          const x = CX + radius * Math.cos(rad);
          const y = CY + radius * Math.sin(rad);
          const scale = interpolate(p, [0, 1], [1, 0.1]);
          const appearOp = interpolate(loopFrame, [startFrame, startFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fadeOp = interpolate(p, [0.75, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const visible = loopFrame >= startFrame && p < 1;

          return (
            <text key={i} x={x} y={y} fill="var(--ink)" fontSize={16 * scale} fontWeight={700} textAnchor="middle"
                  opacity={visible ? appearOp * fadeOp : 0}>
              {it.label}
            </text>
          );
        })}
        {items.map((_, i) =>
          Array.from({ length: 4 }).map((__, c) => (
            <Sequence key={`sfx-${i}-${c}`} from={c * cycleLen + i * ITEM_GAP} durationInFrames={10} layout="none">
              <Audio src={sfxWhoosh(0.3)} volume={0.1} />
            </Sequence>
          ))
        )}
      </svg>

      {scene.vortexNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.vortexNote}
        </div>
      )}
    </div>
  );
};
