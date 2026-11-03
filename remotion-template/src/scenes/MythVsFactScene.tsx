import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxAlert, sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

const CARD_W = 860;
const CARD_H = 480;
const STAMP_START = 20;
const FLIP_START = 45;

// Card que começa mostrando uma afirmação como "MITO", recebe um carimbo vermelho
// "FALSO" com um tremor na tela, e então gira em 3D revelando a verdade em verde do
// outro lado — diferente de "alert" (aviso de risco, sem comparação mito/verdade) e
// "split" (compara dois valores sem o formato de desmentido).
export const MythVsFactScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shakeDecay = interpolate(frame, [STAMP_START, STAMP_START + 16], [10, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const shakeX = frame >= STAMP_START ? Math.sin((frame - STAMP_START) * 2.4) * shakeDecay : 0;

  const stampP = spring({ fps, frame: frame - STAMP_START, config: { damping: 10, stiffness: 200 } });
  const stampScale = interpolate(stampP, [0, 1], [0, 1]);

  const flipP = spring({ fps, frame: frame - FLIP_START, config: { damping: 16, stiffness: 55 } });
  const rotateY = interpolate(flipP, [0, 1], [0, 180]);

  const noteOp = interpolate(frame, [FLIP_START + 24, FLIP_START + 36], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={STAMP_START} durationInFrames={10} layout="none">
        <Audio src={sfxAlert()} volume={0.2} />
      </Sequence>
      <Sequence from={FLIP_START} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.3)} volume={0.14} />
      </Sequence>
      <Sequence from={FLIP_START + 18} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
      <div style={{ width: "100%", maxWidth: CARD_W, height: CARD_H, position: "relative",
                    perspective: 1400, transform: `translateX(${shakeX}px)` }}>
        <div style={{ width: "100%", height: "100%", position: "relative",
                      transformStyle: "preserve-3d", transform: `rotateY(${rotateY}deg)` }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 32, backfaceVisibility: "hidden",
            background: "var(--ink-045)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 24, padding: "0 56px",
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#ff5252", letterSpacing: 3,
                          textTransform: "uppercase", textShadow: SOFT_TEXT_SHADOW }}>
              MITO
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                          textAlign: "center", lineHeight: 1.25, letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
              {scene.mythLabel}
            </div>
            {frame >= STAMP_START && (
              <div style={{
                position: "absolute", transform: `rotate(-12deg) scale(${stampScale})`,
                border: "6px solid #ff5252", borderRadius: 16, padding: "10px 28px",
                fontSize: 48, fontWeight: 900, color: "#ff5252", letterSpacing: 2,
                textShadow: SOFT_TEXT_SHADOW, opacity: stampScale,
              }}>
                FALSO
              </div>
            )}
          </div>

          <div style={{
            position: "absolute", inset: 0, borderRadius: 32, backfaceVisibility: "hidden",
            background: "var(--ink-045)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 24, padding: "0 56px", transform: "rotateY(180deg)",
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#4caf50", letterSpacing: 3,
                          textTransform: "uppercase", textShadow: SOFT_TEXT_SHADOW }}>
              VERDADE
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                          textAlign: "center", lineHeight: 1.25, letterSpacing: -0.5, textShadow: SOFT_TEXT_SHADOW }}>
              {scene.factLabel}
            </div>
          </div>
        </div>
      </div>

      {scene.mythNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.mythNote}
        </div>
      )}
    </div>
  );
};
