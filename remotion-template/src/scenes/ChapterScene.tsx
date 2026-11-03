import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { TEXT_OUTLINE } from "../utils/text";
import { sfxWhoosh } from "../utils/soundSynth";

// Duração do reveal letra-por-letra — usada também pelo rack focus do fundo
// (SceneBackdrop em MotionReel.tsx), os dois precisam terminar juntos.
export const CHAPTER_REVEAL_FRAMES = 26;

// Card de "abertura de capítulo" do vídeo de referência: título serifado
// dourado centralizado, sem barra/caixa de fundo, construído letra por letra
// da esquerda pra direita enquanto o fundo sai de desfocado pra nítido.
export const ChapterScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const title = scene.title || "";
  const revealCount = Math.round(
    interpolate(frame, [0, CHAPTER_REVEAL_FRAMES], [0, title.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  padding: "60px 80px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 700,
                    fontSize: 72, color: accent, letterSpacing: 1, lineHeight: 1.15,
                    maxWidth: "90%", textShadow: TEXT_OUTLINE }}>
        {title.slice(0, revealCount)}
      </div>

      <Sequence from={0} durationInFrames={CHAPTER_REVEAL_FRAMES} layout="none">
        <Audio src={sfxWhoosh(CHAPTER_REVEAL_FRAMES / 30)} volume={0.15} />
      </Sequence>
    </div>
  );
};
