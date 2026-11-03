import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxSuccess } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

// Número gigante contando até um valor-alvo, sem foto de fundo e sem ícone — estatística
// de impacto pura (ex: "87% das pessoas não têm reserva", "+10.000 investidores").
// Diferente de "moneystack"/"battery"/"progress" (sempre têm um elemento visual
// concreto); aqui o número É a cena, pro dado "chocar" por si só.
export const CounterScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Number(...) porque o Gemini às vezes manda o valor como string ("87") — interpolate()
  // exige outputRange numérico de verdade (mesmo bug já corrigido na TimelineEraScene).
  const targetNum = Number(scene.counterTo);
  const target = Number.isFinite(targetNum) ? targetNum : 0;

  const p = spring({ fps, frame: frame - 6, config: { damping: 16, stiffness: 60 }, durationInFrames: 50 });
  const shown = Math.round(interpolate(p, [0, 1], [0, target]));
  const pop = spring({ fps, frame: frame - 6, config: { damping: 9, stiffness: 140 } });
  const scale = interpolate(pop, [0, 1], [0.6, 1]);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 24, padding: "0 60px", boxSizing: "border-box" }}>
      {[10, 24, 38].map((t) => (
        <Sequence key={t} from={t} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={56} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.18} />
      </Sequence>
      {scene.counterLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.counterLabel}
        </div>
      )}

      <div style={{ transform: `scale(${scale})`, fontSize: 150, fontWeight: 900, color: accent,
                    letterSpacing: -4, lineHeight: 1, fontVariantNumeric: "tabular-nums",
                    textShadow: `0 0 50px ${accent}60, ${SOFT_TEXT_SHADOW}` }}>
        {scene.counterPrefix}{shown.toLocaleString("pt-BR")}{scene.counterSuffix}
      </div>

      {scene.counterNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: "var(--ink)",
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.counterNote}
        </div>
      )}
    </div>
  );
};
