import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const REVEAL_START = 30;

// Documento estilo "arquivo confidencial" com tarjas pretas cobrindo o texto; uma tarja
// desliza revelando a palavra escondida — use pra uma informação pouco conhecida ou
// "segredo" sobre o tema, diferente de "receipt" (itens somando um valor, sem suspense).
export const RedactedDocScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const cardOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barX = interpolate(frame, [REVEAL_START, REVEAL_START + 16], [0, 140], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const noteOp = interpolate(frame, [REVEAL_START + 26, REVEAL_START + 38], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const DecoLine: React.FC<{ w: number }> = ({ w }) => (
    <div style={{ width: `${w}%`, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)" }} />
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      <div style={{
        width: "100%", maxWidth: 760, opacity: cardOp, background: "rgba(255,255,255,0.08)",
        borderRadius: 24, padding: "48px 48px", display: "flex", flexDirection: "column", gap: 22,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      }}>
        {scene.redactedTitle && (
          <div style={{ opacity: titleOp, fontSize: 26, fontWeight: 900, color: "#fff",
                        letterSpacing: 2, textTransform: "uppercase", textShadow: SOFT_TEXT_SHADOW }}>
            {scene.redactedTitle}
          </div>
        )}
        <DecoLine w={92} />
        <DecoLine w={76} />

        <div style={{ position: "relative", height: 48, display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: accent, letterSpacing: 1,
                        fontFamily: SERIF_FONT, textShadow: SOFT_TEXT_SHADOW }}>
            {scene.redactedWord}
          </div>
          <div style={{
            position: "absolute", inset: 0, background: "#0b0b10", borderRadius: 6,
            transform: `translateX(${barX}%)`,
          }} />
        </div>

        <DecoLine w={84} />
        <DecoLine w={55} />
      </div>

      {scene.redactedNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.redactedNote}
        </div>
      )}
    </div>
  );
};
