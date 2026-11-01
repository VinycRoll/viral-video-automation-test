import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const ROW_GAP = 14; // frames entre cada item aparecendo

const Row: React.FC<{ label: string; value: string; index: number; bold?: boolean; accent: string }> = ({
  label, value, index, bold, accent,
}) => {
  const frame = useCurrentFrame();
  const start = index * ROW_GAP;
  const op = interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [start, start + 10], [-14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 20, opacity: op,
                  transform: `translateX(${x}px)`, padding: "10px 0",
                  borderBottom: bold ? "none" : "1px dashed rgba(10,10,15,0.18)" }}>
      <div style={{ fontSize: bold ? 26 : 23, fontWeight: bold ? 900 : 600, color: "#0b0b10",
                    fontFamily: bold ? SERIF_FONT : undefined, textTransform: bold ? "uppercase" as const : "none" }}>
        {label}
      </div>
      <div style={{ fontSize: bold ? 26 : 23, fontWeight: 900, color: bold ? accent : "#0b0b10" }}>
        {value}
      </div>
    </div>
  );
};

// Recibo/nota com itens somando até um total em destaque, sem foto de fundo. Usado
// quando o roteiro detalha GASTOS ou COMPOSIÇÃO de um valor (ex: "pra onde vai seu
// salário", "o que compõe essa fatura") — diferente de "proof" (barras de % de divisão).
export const ReceiptScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const items = scene.receiptItems || [];
  const cardP = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardScale = interpolate(cardP, [0, 1], [0.9, 1]);
  const totalStart = items.length * ROW_GAP + 6;
  const noteOp = interpolate(frame, [totalStart + 18, totalStart + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 70px", boxSizing: "border-box", gap: 32 }}>
      <div style={{ opacity: cardP, transform: `scale(${cardScale})`, width: "88%", background: "#f4f1e8",
                    borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.4)", padding: "36px 36px 28px" }}>
        {scene.receiptTitle && (
          <div style={{ fontSize: 26, fontWeight: 900, fontFamily: SERIF_FONT, color: "#0b0b10",
                        textAlign: "center", letterSpacing: 1, marginBottom: 20, textTransform: "uppercase" }}>
            {scene.receiptTitle}
          </div>
        )}
        {items.map((item, i) => (
          <Row key={i} label={item.label} value={item.value} index={i} accent={accent} />
        ))}
        {scene.receiptTotal && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "2px solid rgba(10,10,15,0.3)" }}>
            <Row label="TOTAL" value={scene.receiptTotal} index={items.length} bold accent={accent} />
          </div>
        )}
      </div>

      {scene.receiptNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.receiptNote}
        </div>
      )}
    </div>
  );
};
