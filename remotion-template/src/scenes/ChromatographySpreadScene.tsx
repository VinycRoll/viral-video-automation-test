import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBubble, sfxResonance } from "../utils/soundSynth";

const CX = 160;
const CY = 160;

// Gota de tinta preta no centro de um papel claro que se expande radialmente em anéis
// de cores diferentes (preto -> roxo -> azul -> verde -> amarelo), sem foto de fundo.
// Use pra DECOMPOSIÇÃO de algo complexo em partes, ou química/ciência forense.
export const ChromatographySpreadScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // índice 0 = centro (gota original), índices maiores = anéis mais externos e mais claros
  const RINGS = [
    { color: "#15100b", targetR: 22, duration: 15, opacity: 1 },
    { color: "#6b3fa0", targetR: 68, duration: 35, opacity: 0.88 },
    { color: "#3f79d8", targetR: 104, duration: 55, opacity: 0.72 },
    { color: "#3fa066", targetR: 136, duration: 75, opacity: 0.58 },
    { color: accent, targetR: 165, duration: 95, opacity: 0.42 },
  ];

  const lastDuration = RINGS[RINGS.length - 1].duration;
  const noteOp = interpolate(frame, [lastDuration + 15, lastDuration + 27], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={6} layout="none">
        <Audio src={sfxBubble()} volume={0.16} />
      </Sequence>
      {RINGS.slice(1).map((ring, i) => (
        <Sequence key={i} from={ring.duration} durationInFrames={23} layout="none">
          <Audio src={sfxResonance(520 - i * 60)} volume={0.14} />
        </Sequence>
      ))}

      {scene.chromatographyLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chromatographyLabel}
        </div>
      )}

      <svg width={320} height={320} viewBox="0 0 320 320">
        <circle cx={CX} cy={CY} r={155} fill="#f3ead9" opacity={0.92} />
        {[...RINGS].reverse().map((ring, idx) => {
          const r = interpolate(frame, [0, ring.duration], [0, ring.targetR], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <circle key={idx} cx={CX} cy={CY} r={r} fill={ring.color} opacity={ring.opacity} />;
        })}
      </svg>

      {scene.chromatographyNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.chromatographyNote}
        </div>
      )}
    </div>
  );
};
