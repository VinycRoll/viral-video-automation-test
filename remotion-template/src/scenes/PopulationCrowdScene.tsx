import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick } from "../utils/soundSynth";

const AREA_W = 640;
const AREA_H = 360;
const BASE_START = 6;
const REVEAL_SPAN = 42; // frames entre o primeiro e o último boneco mudando de estado

// hash determinístico pra espalhar os bonecos no grid sem usar Math.random (precisa
// renderizar igual em qualquer frame isolado)
const hash = (i: number) => ((i * 2654435761) % 1000) / 1000;

const Person: React.FC<{ x: number; y: number; scale: number; opacity: number; color: string }> = ({
  x, y, scale, opacity, color,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity }}>
    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, margin: "0 auto 1px" }} />
    <div style={{ width: 16, height: 14, borderRadius: "50% 50% 0 0", background: color }} />
  </div>
);

// Grade de silhuetas de pessoas surgindo (ou desaparecendo) em sequência, sem foto de
// fundo. Use pra ilustrar escala populacional / "quantas pessoas isso afeta" — ex: "1 em
// cada 5 brasileiros" — diferente de "counter" (só um número, sem forma visual).
export const PopulationCrowdScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = scene.crowdCount ?? 60;
  const growing = scene.crowdGrowing ?? true;

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteStart = BASE_START + REVEAL_SPAN + 20;
  const noteOp = interpolate(frame, [noteStart, noteStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cols = Math.max(1, Math.ceil(Math.sqrt(count * (AREA_W / AREA_H))));
  const rows = Math.ceil(count / cols);
  const cellW = AREA_W / cols;
  const cellH = AREA_H / rows;
  const stagger = count > 1 ? REVEAL_SPAN / (count - 1) : 0;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.crowdLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.crowdLabel}
        </div>
      )}

      <div style={{ position: "relative", width: AREA_W, height: AREA_H }}>
        {Array.from({ length: count }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const jx = (hash(i) - 0.5) * cellW * 0.5;
          const jy = (hash(i * 7 + 3) - 0.5) * cellH * 0.5;
          const x = (col + 0.5) * cellW + jx;
          const y = (row + 0.5) * cellH + jy;

          const start = BASE_START + i * stagger;
          const p = spring({ fps, frame: frame - start, config: { damping: 14, stiffness: 160 } });
          const scale = growing ? interpolate(p, [0, 1], [0, 1]) : interpolate(p, [0, 1], [1, 0]);
          const opacity = growing ? p : 1 - p;

          return (
            <React.Fragment key={i}>
              <Sequence from={Math.round(start)} durationInFrames={4} layout="none">
                <Audio src={sfxTick()} volume={0.1} />
              </Sequence>
              <Person x={x} y={y} scale={scale} opacity={opacity}
                      color={i % 5 === 0 ? accent : "var(--ink-75)"} />
            </React.Fragment>
          );
        })}
      </div>

      {scene.crowdNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.crowdNote}
        </div>
      )}
    </div>
  );
};
