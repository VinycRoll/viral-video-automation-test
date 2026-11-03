import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxSuccess } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { VariantFrame } from "../utils/variant";

const BILL_W = 260;
const BILL_H = 60;
const STACK_GAP = 14; // frames entre cada nota empilhando

// Pilha de notas de dinheiro crescendo, uma de cada vez, com leve rotação aleatória
// (parece jogada ali, não um retângulo perfeito) — termina num contador subindo até
// o valor final. Usado quando o roteiro fala de dinheiro/patrimônio se acumulando.
export const MoneyStackScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bills = Math.min(8, Math.max(1, scene.moneyBills || 6));

  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lastBillStart = (bills - 1) * STACK_GAP + 6;
  const counterStart = lastBillStart + 10;
  const counterP = spring({ fps, frame: frame - counterStart, config: { damping: 18, stiffness: 90 }, durationInFrames: 24 });

  // valor em formato pt-BR (ex: "R$ 1.247,50") — ponto é milhar, vírgula é decimal
  const finalValueNum = parseFloat(
    (scene.moneyValue || "R$ 0").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  ) || 0;
  const shownValue = Math.round(interpolate(counterP, [0, 1], [0, finalValueNum]));
  const displayValue = (scene.moneyValue || "").replace(/[\d.,]+/, shownValue.toLocaleString("pt-BR"));

  const noteOp = interpolate(frame, [counterStart + 14, counterStart + 26], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // rotação determinística por índice (sem Math.random — precisa ser estável entre renders)
  const rotFor = (i: number) => ((i * 53) % 13) - 6;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 44 }}>
      {Array.from({ length: bills }, (_, i) => (
        <Sequence key={i} from={i * STACK_GAP} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={counterStart} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.18} />
      </Sequence>
      <VariantFrame variant={variant} accent={accent}>
      <div style={{ position: "relative", width: BILL_W + 60, height: bills * (BILL_H * 0.46) + BILL_H }}>
        {Array.from({ length: bills }, (_, i) => {
          const billStart = i * STACK_GAP;
          const p = spring({ fps, frame: frame - billStart, config: { damping: 14, stiffness: 160 } });
          const dropFrom = -120;
          const y = interpolate(p, [0, 1], [dropFrom, bills * (BILL_H * 0.46) - i * (BILL_H * 0.46)]);
          const op = interpolate(frame, [billStart, billStart + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rot = rotFor(i);
          return (
            <div key={i} style={{
              position: "absolute", left: "50%", bottom: 0, width: BILL_W, height: BILL_H,
              marginLeft: -BILL_W / 2, opacity: op,
              transform: `translateY(${-y}px) rotate(${rot}deg)`,
              borderRadius: 10, background: i % 2 === 0 ? "#2e7d32" : "#388e3c",
              boxShadow: "0 10px 22px rgba(0,0,0,0.45)",
              border: "2px solid var(--ink-18)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 18px", boxSizing: "border-box",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--ink-5)" }} />
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-85)" }}>R$</div>
            </div>
          );
        })}
      </div>
      </VariantFrame>

      <div style={{ opacity: titleOp, textAlign: "center" }}>
        {counterStart <= frame && (
          <div style={{ fontSize: 86, fontWeight: 900, color: accent, letterSpacing: -2,
                        fontVariantNumeric: "tabular-nums", textShadow: `0 0 36px ${accent}50, ${SOFT_TEXT_SHADOW}` }}>
            {displayValue || scene.moneyValue}
          </div>
        )}
      </div>

      {scene.moneyNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.moneyNote}
        </div>
      )}
    </div>
  );
};
