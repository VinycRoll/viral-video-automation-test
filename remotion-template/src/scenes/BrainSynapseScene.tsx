import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBeep } from "../utils/soundSynth";

const W = 280;
const H = 230;
// posições dos "neurônios" dentro do contorno do cérebro
const NEURONS = [
  { x: 90, y: 70 },
  { x: 170, y: 55 },
  { x: 210, y: 120 },
  { x: 140, y: 150 },
  { x: 75, y: 140 },
];
// sequência de segmentos que o pulso percorre (índices em NEURONS)
const PATH = [0, 1, 2, 3, 4];
const SEG_FRAMES = 18;
const START_FRAME = 10;

// Cérebro em silhueta com neurônios conectados por sinapses; um pulso de luz viaja
// pelas conexões e acende a região indicada — use pra ilustrar como o cérebro reage
// a um estímulo (medo, recompensa, vício), diferente da DNAStrandScene (decorativo, sem foco).
export const BrainSynapseScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bodyOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const totalSegs = PATH.length - 1;
  const elapsed = frame - START_FRAME;
  const activeSeg = Math.max(0, Math.min(totalSegs - 1, Math.floor(elapsed / SEG_FRAMES)));
  const segProgress = interpolate(elapsed - activeSeg * SEG_FRAMES, [0, SEG_FRAMES], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const from = NEURONS[PATH[activeSeg]];
  const to = NEURONS[PATH[activeSeg + 1]];
  const dotX = elapsed < 0 ? from.x : from.x + (to.x - from.x) * segProgress;
  const dotY = elapsed < 0 ? from.y : from.y + (to.y - from.y) * segProgress;
  const lastNeuronIdx = Math.min(PATH.length - 1, activeSeg + (segProgress > 0.85 ? 1 : 0));
  const regionOp = elapsed >= 0 ? interpolate(segProgress, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const regionNeuron = NEURONS[PATH[lastNeuronIdx]];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.brainLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.brainLabel}
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: bodyOp }}>
        <path
          d="M60,110 C40,60 90,15 150,20 C210,10 260,45 255,95 C275,115 265,165 230,175 C220,205 170,210 150,195 C110,215 65,190 65,160 C40,150 40,120 60,110 Z"
          fill="var(--ink-06)" stroke="var(--ink-35)" strokeWidth={3}
        />
        {PATH.slice(0, -1).map((idx, i) => {
          const a = NEURONS[idx];
          const b = NEURONS[PATH[i + 1]];
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink-25)" strokeWidth={2} />;
        })}
        {NEURONS.map((n, i) => {
          const isActive = i === PATH[lastNeuronIdx];
          const glow = isActive ? interpolate(segProgress, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
          return <circle key={i} cx={n.x} cy={n.y} r={6 + glow * 6} fill={isActive ? accent : "var(--ink-6)"}
                          style={{ filter: isActive ? `drop-shadow(0 0 ${6 + glow * 10}px ${accent})` : undefined }} />;
        })}
        {NEURONS.map((_, i) => {
          if (i === 0) return null;
          const arriveFrame = Math.round(START_FRAME + (i - 1 + 0.85) * SEG_FRAMES);
          return (
            <Sequence key={`sfx-${i}`} from={arriveFrame} durationInFrames={6} layout="none">
              <Audio src={sfxBeep(1500 + i * 120, 0.05)} volume={0.14} />
            </Sequence>
          );
        })}
        <circle cx={dotX} cy={dotY} r={5} fill={accent} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />
        {scene.brainRegionLabel && regionOp > 0 && (
          <text x={regionNeuron.x} y={regionNeuron.y - 16} textAnchor="middle" fill="var(--ink)"
                fontSize={14} fontWeight={800} opacity={regionOp} style={{ textShadow: SOFT_TEXT_SHADOW }}>
            {scene.brainRegionLabel}
          </text>
        )}
      </svg>

      {scene.brainNote && (
        <div style={{ opacity: interpolate(frame, [START_FRAME + totalSegs * SEG_FRAMES, START_FRAME + totalSegs * SEG_FRAMES + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.brainNote}
        </div>
      )}
    </div>
  );
};
