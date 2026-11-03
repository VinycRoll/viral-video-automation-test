import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxTick, sfxImpact } from "../utils/soundSynth";

const RULER_W = 700;
const TICKS = 13;

// Régua temporal horizontal deslizando com inércia até parar numa data, sem foto de
// fundo. Usado pra uma data ou período histórico específico (ex: "em 1850..."),
// diferente de "roadmap" (etapas de um plano, não um ponto no tempo) e "calendar" (uma
// data do calendário civil, não um ano histórico).
export const TimelineEraScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Number(...) porque o Gemini às vezes manda o ano como string ("1928") em vez de
  // number — interpolate() exige outputRange numérico de verdade, "1928" quebra.
  const toNum = Number(scene.eraTo);
  const to = Number.isFinite(toNum) ? toNum : 2026;
  const fromNum = Number(scene.eraFrom);
  const from = Number.isFinite(fromNum) ? fromNum : to - 200;

  const settleP = spring({ fps, frame: frame - 4, config: { damping: 18, stiffness: 40 } });
  const year = interpolate(settleP, [0, 1], [from, to]);
  const rulerShift = interpolate(settleP, [0, 1], [-140, 0]);

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [50, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spinTicks = [4, 10, 16, 22, 28, 34];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 30, padding: "0 60px", boxSizing: "border-box" }}>
      {spinTicks.map((t, i) => (
        <Sequence key={i} from={t} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={40} durationInFrames={13} layout="none">
        <Audio src={sfxImpact(0.2)} volume={0.2} />
      </Sequence>
      {scene.eraLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.eraLabel}
        </div>
      )}

      <div style={{ fontSize: 110, fontWeight: 900, color: accent, letterSpacing: -3,
                    fontVariantNumeric: "tabular-nums", textShadow: `0 0 40px ${accent}60, ${SOFT_TEXT_SHADOW}` }}>
        {Math.round(year)}
      </div>

      <div style={{ position: "relative", width: RULER_W, height: 40, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: rulerShift, top: 18, display: "flex", width: RULER_W + 140 }}>
          {Array.from({ length: TICKS }).map((_, i) => (
            <div key={i} style={{ width: (RULER_W + 140) / TICKS, height: i % 3 === 0 ? 20 : 10,
                                   borderLeft: "2px solid var(--ink-3)" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: "50%", top: 0, width: 4, height: 40,
                      background: accent, boxShadow: `0 0 12px ${accent}90`, transform: "translateX(-50%)" }} />
      </div>

      {scene.eraNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: "var(--ink)",
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.eraNote}
        </div>
      )}
    </div>
  );
};
