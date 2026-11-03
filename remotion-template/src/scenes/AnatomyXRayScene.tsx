import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxLaser } from "../utils/soundSynth";

const BOX = 280;

// Um scanner vertical varre um ícone revelando uma camada "interna" diferente por baixo,
// sem foto de fundo. Usado pra explicar COMO ALGO FUNCIONA POR DENTRO (ex: "o que tem
// dentro do seu score de crédito") — diferente de "censored" (revela nitidez, não uma
// camada diferente) e "magnify" (amplia um detalhe, não troca a camada inteira).
export const AnatomyXRayScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const scanPct = interpolate(frame, [10, 50], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const capsOp = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [56, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 28, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={10} durationInFrames={8} layout="none">
        <Audio src={sfxLaser()} volume={0.15} />
      </Sequence>

      {scene.xrayLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.xrayLabel}
        </div>
      )}

      <div style={{ position: "relative", width: BOX, height: BOX, borderRadius: 32, overflow: "hidden",
                    border: "2px solid var(--ink-2)", background: "var(--ink-06)" }}>
        <div style={{
          position: "absolute", inset: 0, background: `${accent}22`,
          backgroundImage: `radial-gradient(${accent}55 2px, transparent 2px)`,
          backgroundSize: "24px 24px",
          clipPath: `inset(0 ${100 - scanPct}% 0 0)`,
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: `${scanPct}%`, width: 4,
          background: "var(--ink)", boxShadow: "0 0 24px var(--ink), 0 0 48px " + accent,
        }} />
      </div>

      {(scene.xrayOutside || scene.xrayInside) && (
        <div style={{ opacity: capsOp, display: "flex", width: BOX, justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink-6)",
                        textTransform: "uppercase", letterSpacing: 0.5 }}>
            {scene.xrayOutside}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: accent,
                        textTransform: "uppercase", letterSpacing: 0.5 }}>
            {scene.xrayInside}
          </div>
        </div>
      )}

      {scene.xrayNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: "var(--ink)",
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.xrayNote}
        </div>
      )}
    </div>
  );
};
