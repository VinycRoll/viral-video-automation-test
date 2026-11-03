import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxBeep } from "../utils/soundSynth";

const W = 560;
const H = 260;
const LENS_R = 92;
const REST_X = W / 2;
const REST_Y = H / 2;
const ARRIVE_FRAME = 30;

// Lupa que atravessa a tela em diagonal até focar e ampliar um detalhe escondido no
// conteúdo — use pra revelar um detalhe pouco notado sobre o tema, diferente de
// "censored" (que começa borrado por inteiro, sem a metáfora de "procurar e achar").
export const MagnifyingGlassScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const moveP = interpolate(frame, [0, ARRIVE_FRAME], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const dx = interpolate(moveP, [0, 1], [-190, 0]);
  const dy = interpolate(moveP, [0, 1], [-100, 0]);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revealOp = interpolate(frame, [ARRIVE_FRAME - 6, ARRIVE_FRAME + 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const noteOp = interpolate(frame, [ARRIVE_FRAME + 20, ARRIVE_FRAME + 32], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.3)} volume={0.14} />
      </Sequence>
      <Sequence from={ARRIVE_FRAME} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1000, 0.1)} volume={0.18} />
      </Sequence>
      {scene.magnifyLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.magnifyLabel}
        </div>
      )}

      <div style={{ position: "relative", width: W, height: H }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, fontWeight: 700, color: "var(--ink-3)", textAlign: "center",
        }}>
          {scene.magnifyTitle}
        </div>

        <div style={{
          position: "absolute", inset: 0, opacity: revealOp,
          clipPath: `circle(${LENS_R}px at ${REST_X}px ${REST_Y}px)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: accent, textAlign: "center",
                        letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW, transform: "scale(1.4)" }}>
            {scene.magnifyTitle}
          </div>
        </div>

        <div style={{
          position: "absolute", left: REST_X - LENS_R - 10, top: REST_Y - LENS_R - 10,
          width: (LENS_R + 10) * 2, height: (LENS_R + 10) * 2,
          transform: `translate(${dx}px, ${dy}px)`,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="40" cy="40" r="30" fill="none" stroke={accent} strokeWidth={6}
                    style={{ filter: `drop-shadow(0 0 16px ${accent}60)` }} />
            <line x1="62" y1="62" x2="92" y2="92" stroke={accent} strokeWidth={8} strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {scene.magnifyNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.magnifyNote}
        </div>
      )}
    </div>
  );
};
