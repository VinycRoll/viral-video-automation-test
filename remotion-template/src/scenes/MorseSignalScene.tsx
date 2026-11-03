import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxBeep } from "../utils/soundSynth";

const UNIT = 14;

// Ponto luminoso piscando ritmadamente em pontos/traços enquanto o código morse e
// sua tradução são revelados progressivamente. Use pra CÓDIGOS, comunicação
// secreta ou SOS/emergência.
export const MorseSignalScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const code = scene.morseCode || "... --- ...";
  const word = scene.morseWord || "SOS";

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const symbols = code.split("");
  const segments = symbols.map((s, i) => ({
    start: i * UNIT,
    dur: s === "-" ? UNIT * 1.6 : s === " " ? 0 : UNIT * 0.8,
    symbol: s,
  }));
  const cycleLen = symbols.length * UNIT + 30;
  const loopFrame = frame % cycleLen;

  const activeSegment = segments.find((seg) => loopFrame >= seg.start && loopFrame < seg.start + seg.dur && seg.symbol !== " ");
  const dotOn = !!activeSegment;

  const revealedCount = Math.min(symbols.length, Math.floor(loopFrame / UNIT) + 1);
  const revealedCode = code.slice(0, revealedCount);
  const lettersRevealed = Math.min(word.length, revealedCode.split(" ").length);
  const revealedWord = word.slice(0, lettersRevealed);

  const noteOp = interpolate(frame, [symbols.length * UNIT, symbols.length * UNIT + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {Array.from({ length: 4 }).map((_, c) =>
        segments
          .filter((seg) => seg.symbol !== " ")
          .map((seg, i) => {
            const isDash = seg.symbol === "-";
            const dur = isDash ? 0.14 : 0.06;
            return (
              <Sequence key={`${c}-${i}`} from={c * cycleLen + seg.start} durationInFrames={Math.ceil(dur * 30) + 2} layout="none">
                <Audio src={sfxBeep(isDash ? 700 : 950, dur, "square")} volume={0.13} />
              </Sequence>
            );
          })
      )}

      {scene.morseLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.morseLabel}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", backgroundColor: dotOn ? accent : "var(--ink-15)",
                      filter: dotOn ? `drop-shadow(0 0 20px ${accent})` : "none", transition: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 50 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const h = dotOn ? 16 + 14 * Math.abs(Math.sin(frame * 0.6 + i)) : 6;
            return <div key={i} style={{ width: 8, height: h, backgroundColor: accent, borderRadius: 3, opacity: 0.8 }} />;
          })}
        </div>
      </div>

      <div style={{ fontSize: 30, fontFamily: "monospace", color: "var(--ink)", letterSpacing: 4, textShadow: SOFT_TEXT_SHADOW, minHeight: 36 }}>
        {revealedCode}
      </div>

      <div style={{ fontSize: 44, fontWeight: 800, color: accent, letterSpacing: 2, textShadow: SOFT_TEXT_SHADOW, minHeight: 50 }}>
        {revealedWord}
      </div>

      {scene.morseNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.morseNote}
        </div>
      )}
    </div>
  );
};
