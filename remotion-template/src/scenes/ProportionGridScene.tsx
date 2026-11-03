import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxBeep } from "../utils/soundSynth";

const DOT = 18;
const GAP = 8;

const Dot: React.FC<{ lit: boolean; index: number; accent: string }> = ({ lit, index, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ fps, frame: frame - 10 - index * 1.5, config: { damping: 12, stiffness: 200 } });
  const scale = lit ? interpolate(p, [0, 1], [1, 1.25]) * interpolate(p, [0, 0.01], [0.6, 1], { extrapolateRight: "clamp" }) : 1;

  return (
    <div style={{
      width: DOT, height: DOT, borderRadius: "50%", transform: `scale(${lit ? Math.max(scale, 0.6) : 1})`,
      background: lit ? accent : "var(--ink-14)",
      boxShadow: lit ? `0 0 10px ${accent}90` : "none",
    }} />
  );
};

// Grade de ícones onde só uma fração acende na cor do vídeo, sem foto de fundo. Usado
// pra proporções do tipo "X em cada Y" (ex: "só 3 em cada 100 pessoas investem"),
// diferente de "progress" (um só valor contínuo 0-100%, não unidades discretas).
export const ProportionGridScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const total = Math.max(1, scene.gridTotal ?? 100);
  const highlight = Math.min(total, scene.gridHighlight ?? 3);
  const cols = Math.ceil(Math.sqrt(total));

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [10 + highlight * 1.5 + 20, 10 + highlight * 1.5 + 32], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.gridLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.gridLabel}
        </div>
      )}

      {Array.from({ length: highlight }).map((_, i) => (
        <Sequence key={i} from={Math.round(10 + i * 1.5)} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={Math.round(10 + highlight * 1.5)} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(900, 0.1)} volume={0.18} />
      </Sequence>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${DOT}px)`, gap: GAP,
                    justifyContent: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
          <Dot key={i} lit={i < highlight} index={i} accent={accent} />
        ))}
      </div>

      {scene.gridNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.gridNote}
        </div>
      )}
    </div>
  );
};
