import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";
import { sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

// y do roteiro: 0 = base do gráfico, 100 = topo — SVG inverte (0 = topo da viewBox)
const toSvgY = (y: number) => 100 - y;

function pathD(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${toSvgY(p.y)}`).join(" ");
}

// Comprimento real do polyline (soma das distâncias entre pontos consecutivos).
// Usado como base do dasharray/dashoffset em vez do atributo pathLength=1: o
// Chromium headless do Remotion normaliza mal o pathLength em paths com vários
// segmentos "L", criando gaps visíveis em cada vértice no vídeo renderizado
// (confirmado comparando still vs. render final) — comprimento real evita isso.
function pathLen(points: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function drawOffset(frame: number, from: number, to: number, len: number): number {
  return interpolate(frame, [from, to], [len, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

function counterValue(frame: number, start: number, frames: number, to: number): number {
  const p = interpolate(frame, [start, start + frames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return Math.round(to * p);
}

// Linha de crescimento (patrimônio) desenhada ao vivo — nasce cinza/estagnada,
// muda pra accent exatamente onde a causa (growthTurnIndex) acontece, podendo se
// bifurcar num 2º ramo (ex: guardar pouco vs. investir em você). Sem foto de fundo,
// mesmo motivo de "proof": o dado é o visual, não uma metáfora de banco de imagens.
export const GrowthScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(scene.duration * fps);

  const points = scene.growthPoints || [];
  const turnIndex = scene.growthTurnIndex;
  const hasCold = turnIndex != null && turnIndex > 0 && turnIndex < points.length - 1;
  const coldPoints = hasCold ? points.slice(0, turnIndex + 1) : [];
  const accentPoints = hasCold ? points.slice(turnIndex) : points;
  const forkPoints = scene.growthForkPoints || [];

  const coldEnd = hasCold ? Math.round(total * 0.35) : 0;
  const accentEnd = Math.round(total * (forkPoints.length > 1 ? 0.68 : 0.82));
  const forkEnd = Math.round(total * 0.95);

  const titleOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dotScale = forkPoints.length > 0
    ? spring({ fps, frame: frame - accentEnd, config: { damping: 14, stiffness: 160 } })
    : 0;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 70px", boxSizing: "border-box", gap: 28 }}>
      {scene.growthTitle && (
        <div style={{ opacity: titleOp, fontSize: 40, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
          <BlurReveal text={scene.growthTitle} startFrame={0} />
        </div>
      )}

      {scene.growthCounters && scene.growthCounters.length > 0 && (
        <div style={{ display: "flex", gap: 48, justifyContent: "center" }}>
          {scene.growthCounters.map((c, i) => {
            const start = Math.round(total * (0.15 + i * 0.05));
            const value = counterValue(frame, start, Math.max(30, total - start - 20), c.to);
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: -0.5,
                              fontVariantNumeric: "tabular-nums", color: c.accent ? accent : "var(--ink-85)",
                              textShadow: SOFT_TEXT_SHADOW }}>
                  {(c.prefix || "") + value.toLocaleString("pt-BR") + (c.suffix || "")}
                </div>
                {c.label && <div style={{ fontSize: 24, color: "var(--ink-6)", marginTop: 4 }}>{c.label}</div>}
              </div>
            );
          })}
        </div>
      )}

      {points.length > 1 && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 420 }}>
          {hasCold && (
            <path d={pathD(coldPoints)} fill="none" stroke="var(--ink-35)" strokeWidth={2.4}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={pathLen(coldPoints)} strokeDashoffset={drawOffset(frame, 0, coldEnd, pathLen(coldPoints))} />
          )}
          <path d={pathD(accentPoints)} fill="none" stroke={accent} strokeWidth={2.8}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={pathLen(accentPoints)} strokeDashoffset={drawOffset(frame, coldEnd, accentEnd, pathLen(accentPoints))}
                style={{ filter: `drop-shadow(0 0 6px ${accent}80)` }} />
          {forkPoints.length > 1 && (
            <path d={pathD(forkPoints)} fill="none" stroke={accent} strokeWidth={2.8}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={pathLen(forkPoints)} strokeDashoffset={drawOffset(frame, accentEnd, forkEnd, pathLen(forkPoints))}
                  style={{ filter: `drop-shadow(0 0 6px ${accent}80)` }} />
          )}
          {forkPoints.length > 0 && (
            <circle cx={forkPoints[0].x} cy={toSvgY(forkPoints[0].y)} r={3 * dotScale} fill={accent} />
          )}
        </svg>
      )}

      <Sequence from={0} durationInFrames={Math.min(accentEnd, 36)} layout="none">
        <Audio src={sfxWhoosh(Math.min(accentEnd, 36) / 30)} volume={0.13} />
      </Sequence>
      <Sequence from={accentEnd} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
    </div>
  );
};
