import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const JAR_W = 220;
const JAR_H = 260;
const COIN_GAP = 14; // frames entre cada moeda caindo

// Moedas caindo uma a uma dentro de um pote de vidro, terminando num contador subindo
// até o valor final. Usado quando o roteiro fala de economizar/guardar dinheiro pouco a
// pouco — mais literal que "moneystack" (notas empilhadas) e sem a conotação de meta
// batida do "achievement".
export const PiggyBankScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const coins = Math.min(8, Math.max(1, scene.piggyCoins || 5));

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jarOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lastCoinStart = (coins - 1) * COIN_GAP + 6;
  const counterStart = lastCoinStart + 10;
  const counterP = spring({ fps, frame: frame - counterStart, config: { damping: 18, stiffness: 90 }, durationInFrames: 24 });

  const finalValueNum = parseFloat(
    (scene.piggyValue || "R$ 0").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  ) || 0;
  const shownValue = Math.round(interpolate(counterP, [0, 1], [0, finalValueNum]));
  const displayValue = (scene.piggyValue || "").replace(/[\d.,]+/, shownValue.toLocaleString("pt-BR"));

  const noteOp = interpolate(frame, [counterStart + 14, counterStart + 26], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36 }}>
      {Array.from({ length: coins }, (_, i) => (
        <Sequence key={i} from={i * COIN_GAP} durationInFrames={4} layout="none">
          <Audio src={sfxTick(1800)} volume={0.1} />
        </Sequence>
      ))}
      {scene.piggyLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.piggyLabel}
        </div>
      )}

      <div style={{ position: "relative", width: JAR_W, height: JAR_H, opacity: jarOp }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 24, bottom: 0, borderRadius: "0 0 36px 36px",
                      border: "5px solid var(--ink-4)", borderTop: "none",
                      background: "var(--ink-05)", overflow: "hidden" }}>
          {Array.from({ length: coins }, (_, i) => {
            const coinStart = i * COIN_GAP;
            const p = spring({ fps, frame: frame - coinStart, config: { damping: 11, stiffness: 150 } });
            const y = interpolate(p, [0, 1], [-260, JAR_H - 24 - (i + 1) * 22]);
            const op = interpolate(frame, [coinStart, coinStart + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const rot = ((i * 47) % 30) - 15;
            return (
              <div key={i} style={{
                position: "absolute", left: "50%", top: 0, width: 56, height: 56, marginLeft: -28,
                borderRadius: "50%", opacity: op, transform: `translateY(${y}px) rotate(${rot}deg)`,
                background: accent, boxShadow: `0 6px 14px rgba(0,0,0,0.4), inset 0 0 0 3px var(--ink-3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 900, color: "#0b0b10",
              }}>$</div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: "10%", right: "10%", top: 0, height: 24, borderRadius: 8,
                      border: "5px solid var(--ink-4)", background: "transparent" }} />
      </div>

      <div style={{ textAlign: "center" }}>
        {counterStart <= frame && (
          <div style={{ fontSize: 86, fontWeight: 900, color: accent, letterSpacing: -2,
                        fontVariantNumeric: "tabular-nums", textShadow: `0 0 36px ${accent}50, ${SOFT_TEXT_SHADOW}` }}>
            {displayValue || scene.piggyValue}
          </div>
        )}
      </div>

      {scene.piggyNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.piggyNote}
        </div>
      )}
    </div>
  );
};
