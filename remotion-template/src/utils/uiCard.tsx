import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "./text";

// Shell reutilizado pelas cenas de UI sem foto de fundo (proof/growth/calendar/clock/
// moneystack/...): card translúcido centralizado + título opcional com BlurReveal.
// Extraído de ProofScene/CardScene pra não duplicar o mesmo wrapper em cada cena nova.
export const UiCard: React.FC<{
  title?: string;
  startFrame?: number;
  width?: string;
  children: React.ReactNode;
}> = ({ title, startFrame = 0, width = "90%", children }) => {
  const frame = useCurrentFrame();
  const cardOp = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 70px", boxSizing: "border-box" }}>
      <div style={{ opacity: cardOp, background: "var(--card-fill)", borderRadius: 28,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                    padding: "44px 48px", width, boxSizing: "border-box" }}>
        {title && (
          <div style={{ fontSize: 38, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)", marginBottom: 32,
                        textAlign: "center", letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
            <BlurReveal text={title} startFrame={startFrame} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
