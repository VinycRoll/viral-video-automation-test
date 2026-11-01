import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { VariantFrame } from "../utils/variant";

const BOOK_W = 280;
const BOOK_H = 360;

// Livro fechado que abre (capa gira como uma porta a partir da lombada) revelando o
// título na página, sem foto de fundo. Usado quando o roteiro fala de aprendizado ou
// educação financeira (ex: "estude antes de investir", "conhecimento é a base").
export const BookScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bookP = spring({ fps, frame: frame - 4, config: { damping: 14, stiffness: 130 } });
  const bookScale = interpolate(bookP, [0, 1], [0.8, 1]);
  const bookOp = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const openStart = 18;
  const openFrames = 20;
  const openP = interpolate(frame, [openStart, openStart + openFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const coverDeg = interpolate(openP, [0, 1], [0, -150]);
  const pageOp = interpolate(openP, [0, 0.5, 1], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [openStart + openFrames + 8, openStart + openFrames + 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 34 }}>
      {scene.bookLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.bookLabel}
        </div>
      )}

      <VariantFrame variant={variant} accent={accent}>
        <div style={{ position: "relative", width: BOOK_W, height: BOOK_H, opacity: bookOp,
                      transform: `scale(${bookScale})`, perspective: 900 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#f4f1e8",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.4)", opacity: pageOp,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "0 28px", gap: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0b0b10", textAlign: "center", fontFamily: SERIF_FONT }}>
              {scene.bookTitle || "EDUCAÇÃO FINANCEIRA"}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: `${70 - i * 10}%`, height: 6, borderRadius: 3,
                                     background: "rgba(10,10,15,0.15)" }} />
            ))}
          </div>

          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: accent,
                        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                        transformOrigin: "0% 50%", transform: `rotateY(${coverDeg}deg)`,
                        backfaceVisibility: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", border: "4px solid rgba(11,11,16,0.5)" }} />
          </div>

          <div style={{ position: "absolute", left: -6, top: 0, width: 12, height: BOOK_H,
                        borderRadius: "6px 0 0 6px", background: "rgba(0,0,0,0.3)" }} />
        </div>
      </VariantFrame>

      {scene.bookNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.bookNote}
        </div>
      )}
    </div>
  );
};
