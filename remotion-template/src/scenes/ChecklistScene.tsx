import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Scene } from "../types";
import { UiCard } from "../utils/uiCard";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";

const ITEM_GAP = 20; // frames entre cada item marcando check

// Caixa de checkbox que desenha o "V" do check via spring depois que o item aparece —
// itens marcam em sequência, como um checklist sendo cumprido ao vivo.
const CheckItem: React.FC<{ text: string; index: number; accent: string }> = ({ text, index, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appearStart = index * ITEM_GAP;
  const rowOp = interpolate(frame, [appearStart, appearStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const rowX = interpolate(frame, [appearStart, appearStart + 10], [-16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const checkStart = appearStart + 8;
  const checkP = spring({ fps, frame: frame - checkStart, config: { damping: 12, stiffness: 200 } });
  const checked = checkP > 0.05;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: rowOp,
                  transform: `translateX(${rowX}px)`, marginBottom: 26 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        border: `2.5px solid ${checked ? accent : "rgba(255,255,255,0.35)"}`,
        background: checked ? accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "none",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" style={{ opacity: checkP }}>
          <path
            d="M4 12.5L9.5 18L20 6"
            fill="none" stroke="#0b0b10" strokeWidth={3.4}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={28}
            strokeDashoffset={interpolate(checkP, [0, 1], [28, 0])}
          />
        </svg>
      </div>
      <div style={{
        fontSize: 32, fontWeight: 700, color: checked ? "rgba(255,255,255,0.55)" : "#fff",
        textDecoration: checked ? "line-through" : "none",
        textDecorationColor: "rgba(255,255,255,0.4)",
      }}>
        {text}
      </div>
    </div>
  );
};

// Card de checklist (estilo native-ui) — itens marcam check em sequência, sem foto de
// fundo. Usado quando o roteiro descreve um passo a passo ou lista de ações concretas.
// variant 0 = itens soltos direto no gradiente (sem card); variant 1 = dentro do UiCard
// (visual original) — dá outra textura pra mesma cena entre vídeos diferentes.
export const ChecklistScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 1 }) => {
  const items = scene.checklistItems || [];
  const list = (
    <div style={{ marginTop: scene.checklistTitle ? 8 : 0 }}>
      {items.map((text, i) => (
        <CheckItem key={i} text={text} index={i} accent={accent} />
      ))}
    </div>
  );
  if (variant % 2 === 0) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", padding: "60px 90px", boxSizing: "border-box" }}>
        {scene.checklistTitle && (
          <div style={{ fontSize: 38, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff", marginBottom: 24,
                        textAlign: "center", letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
            <BlurReveal text={scene.checklistTitle} startFrame={0} />
          </div>
        )}
        {list}
      </div>
    );
  }
  return (
    <UiCard title={scene.checklistTitle} width="92%">
      {list}
    </UiCard>
  );
};
