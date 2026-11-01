import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const REVEAL_START = 30;
const REVEAL_END = 50;

// Texto/valor que começa borrado com um ícone de "olho cortado" flutuando acima, e
// fica nítido revelando um ícone de olho aberto — use pra criar suspense antes de um
// número ou fato, diferente de "redacted" (tarja preta sólida, sem a metáfora de
// borrão/censura).
export const CensoredRevealScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const blurPx = interpolate(frame, [REVEAL_START, REVEAL_END], [18, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const iconOp = interpolate(frame, [REVEAL_START, REVEAL_END], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const openIconOp = interpolate(frame, [REVEAL_END - 4, REVEAL_END + 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [REVEAL_END + 16, REVEAL_END + 28], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const EyeIcon: React.FC<{ slashed: boolean; opacity: number }> = ({ slashed, opacity }) => (
    <svg width="56" height="56" viewBox="0 0 24 24" style={{ opacity }}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" fill="none" stroke={accent} strokeWidth={1.6} />
      <circle cx="12" cy="12" r="3.2" fill={accent} />
      {slashed && <line x1="3" y1="3" x2="21" y2="21" stroke="#ff5252" strokeWidth={2.2} strokeLinecap="round" />}
    </svg>
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.censoredLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.censoredLabel}
        </div>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <EyeIcon slashed opacity={iconOp} />
        <div style={{ position: "absolute", transform: "translateY(2px)" }}>
          <EyeIcon slashed={false} opacity={openIconOp} />
        </div>
      </div>

      <div style={{ fontSize: 48, fontWeight: 900, color: accent, textAlign: "center",
                    letterSpacing: -0.5, filter: `blur(${blurPx}px)`, textShadow: SOFT_TEXT_SHADOW }}>
        {scene.censoredText}
      </div>

      {scene.censoredNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.censoredNote}
        </div>
      )}
    </div>
  );
};
