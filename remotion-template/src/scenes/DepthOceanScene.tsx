import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBubble, sfxResonance } from "../utils/soundSynth";

const DARKEN_END_FRAME = 160;

// Fundo em gradiente que escurece progressivamente (azul claro → quase preto), simulando
// uma descida contínua no oceano, com marcadores de profundidade revelados em sequência —
// use pra "mergulhos" de qualquer tipo (profundidade real, escala de tempo, escala de dinheiro).
export const DepthOceanScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const marks = scene.depthMarks ?? [];

  const darkenT = interpolate(frame, [0, DARKEN_END_FRAME], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const topColor = `rgb(${interpolate(darkenT, [0, 1], [79, 2])},${interpolate(darkenT, [0, 1], [184, 2])},${interpolate(darkenT, [0, 1], [232, 8])})`;
  const bottomColor = `rgb(${interpolate(darkenT, [0, 1], [10, 2])},${interpolate(darkenT, [0, 1], [40, 2])},${interpolate(darkenT, [0, 1], [70, 8])})`;

  const lastNoteStart = marks.length ? (marks.length - 1) * 40 + 20 : 0;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: -1,
                    background: `linear-gradient(to bottom, ${topColor}, ${bottomColor})` }} />

      {scene.depthLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.depthLabel}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {marks.map((m, i) => {
          const startF = i * 40 + 20;
          const op = interpolate(frame, [startF, startF + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const dy = interpolate(frame, [startF, startF + 14], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isLatest = i === marks.length - 1;
          const dim = isLatest ? 1 : 0.5;
          return (
            <React.Fragment key={i}>
              <div style={{
                opacity: op * dim, transform: `translateY(${dy}px)`,
                fontSize: isLatest ? 46 : 28, fontWeight: 800, color: isLatest ? accent : "var(--ink)",
                textShadow: SOFT_TEXT_SHADOW,
              }}>
                {m.label}
              </div>
              <Sequence from={startF} durationInFrames={6} layout="none">
                <Audio src={sfxBubble()} volume={0.1} />
              </Sequence>
            </React.Fragment>
          );
        })}
      </div>

      <Sequence from={DARKEN_END_FRAME} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(90)} volume={0.15} />
      </Sequence>

      {scene.depthNote && (
        <div style={{ opacity: interpolate(frame, [lastNoteStart + 16, lastNoteStart + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      fontSize: 34, fontWeight: 800, color: accent, textAlign: "center", textTransform: "uppercase",
                      letterSpacing: 1, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.depthNote}
        </div>
      )}
    </div>
  );
};
