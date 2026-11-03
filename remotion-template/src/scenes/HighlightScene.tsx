import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { splitHighlightWords, colorForWord, TEXT_OUTLINE } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

export const HighlightScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitHighlightWords(scene.text || "");

  const lineW = interpolate(frame, [12, 32], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tamanho fixo (80) só cabe em frases curtas tipo "juros compostos"; o Gemini às vezes
  // manda uma frase inteira aqui, que viraria um bloco de 5-6 linhas cobrindo a tela toda.
  // shortcut: heurística linear calibrada a olho pra largura de ~95% em 1080px; se o padding
  // ou a largura do container mudar, recalibrar os números abaixo.
  const rawLen = words.reduce((acc, w) => acc + w.text.length + 1, 0);
  const fontSize = Math.max(36, Math.min(80, 80 - Math.max(0, rawLen - 20) * 0.6));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: "60px 80px",
                  boxSizing: "border-box", textAlign: "center", gap: 24 }}>

      <div style={{ width: `${lineW}%`, height: 4,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, borderRadius: 2 }} />

      <div style={{ fontSize, fontWeight: 900, color: "#fff", lineHeight: 1.15,
                    textTransform: "uppercase", letterSpacing: -1, maxWidth: "95%", textShadow: TEXT_OUTLINE }}>
        {words.map((word, i) => {
          const delay = 4 + i * 4;
          const p = spring({ fps, frame: frame - delay, config: { damping: 11, stiffness: 220 } });
          return (
            <React.Fragment key={i}>
              <span style={{
                display: "inline-block", marginRight: "0.28em", color: colorForWord(word.color, accent, "#fff"),
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p, [0, 1], [45, 0])}px) scale(${interpolate(p, [0, 1], [0.35, 1])})`,
              }}>
                {word.text}
              </span>
              <Sequence from={delay} durationInFrames={10} layout="none">
                <Audio src={sfxWhoosh(0.15)} volume={0.1} />
              </Sequence>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ width: `${lineW}%`, height: 4,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, borderRadius: 2 }} />
    </div>
  );
};
