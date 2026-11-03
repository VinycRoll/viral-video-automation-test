import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxWhoosh } from "../utils/soundSynth";

const NODE_R = 36;
const GAP = 220;
const START_FRAME = 10;
const STEP_STAGGER = 28;

// Três estações conectadas por uma linha que "acende" da esquerda pra direita — use pra
// ilustrar um processo/fluxo sequencial em etapas, diferente de "pyramidhierarchy"
// (camadas verticais estáticas, não um fluxo que avança).
export const SupplyChainScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = scene.supplySteps ?? [];
  const n = steps.length;
  const totalW = (n - 1) * GAP;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastStart = START_FRAME + (n - 1) * STEP_STAGGER;
  const noteStart = lastStart + 24;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.supplyLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.supplyLabel}
        </div>
      )}

      <svg width={totalW + NODE_R * 2 + 20} height={140} viewBox={`0 0 ${totalW + NODE_R * 2 + 20} 140`}>
        {steps.slice(0, -1).map((_, i) => {
          const x1 = NODE_R + 10 + i * GAP;
          const x2 = NODE_R + 10 + (i + 1) * GAP;
          const litStart = START_FRAME + i * STEP_STAGGER + 6;
          const lineP = interpolate(frame, [litStart, litStart + STEP_STAGGER - 8], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const xMid = x1 + (x2 - x1) * lineP + NODE_R;
          return (
            <g key={i}>
              <Sequence from={litStart} durationInFrames={10} layout="none">
                <Audio src={sfxWhoosh(0.18)} volume={0.13} />
              </Sequence>
              <line x1={x1 + NODE_R} y1={50} x2={x2 - NODE_R} y2={50} stroke="var(--ink-2)" strokeWidth={4} />
              <line x1={x1 + NODE_R} y1={50} x2={Math.min(xMid, x2 - NODE_R)} y2={50} stroke={accent} strokeWidth={4}
                    style={{ filter: `drop-shadow(0 0 6px ${accent}90)` }} />
            </g>
          );
        })}

        {steps.map((step, i) => {
          const litFrame = START_FRAME + i * STEP_STAGGER;
          const popP = spring({ fps, frame: frame - litFrame, config: { damping: 13, stiffness: 150 } });
          const lit = frame >= litFrame;
          const scale = interpolate(popP, [0, 1], [1, 1.18]);
          const cx = NODE_R + 10 + i * GAP;
          return (
            <g key={i} transform={`translate(${cx}, 50)`}>
              <Sequence from={litFrame} durationInFrames={4} layout="none">
                <Audio src={sfxTick()} volume={0.1} />
              </Sequence>
              <circle r={NODE_R * (lit ? scale : 1)} fill={lit ? accent : "var(--ink-15)"}
                      stroke="var(--ink-4)" strokeWidth={2}
                      style={lit ? { filter: `drop-shadow(0 0 10px ${accent}90)` } : undefined} />
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", width: totalW + NODE_R * 2 + 20, justifyContent: "space-between" }}>
        {steps.map((step, i) => {
          const litFrame = START_FRAME + i * STEP_STAGGER;
          const textOp = interpolate(frame, [litFrame + 4, litFrame + 16], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{
              opacity: textOp, width: GAP, textAlign: "center", color: "var(--ink)", fontSize: 20,
              fontWeight: 700, fontFamily: SERIF_FONT, marginLeft: i === 0 ? -GAP / 2 + NODE_R : undefined,
            }}>
              {step.label}
            </div>
          );
        })}
      </div>

      {scene.supplyNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.supplyNote}
        </div>
      )}
    </div>
  );
};
