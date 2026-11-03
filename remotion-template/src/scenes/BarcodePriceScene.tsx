import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxLaser, sfxBeep } from "../utils/soundSynth";

const NUM_BARS = 24;
const CARD_W = 300;
const CARD_H = 180;
const GROWTH_END = NUM_BARS * 2 + 10;
const LASER_END = GROWTH_END + 45;

const hash = (i: number) => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Código de barras surgindo barra a barra, atravessado por um laser vermelho que
// desliza de cima a baixo e revela o valor ao terminar a passada. Use pra PREÇO,
// identificação ou escaneamento de dados.
export const BarcodePriceScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const laserY = interpolate(frame, [GROWTH_END, LASER_END], [10, CARD_H - 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const laserOp = interpolate(frame, [GROWTH_END, GROWTH_END + 4, LASER_END - 4, LASER_END], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const valueOp = interpolate(frame, [LASER_END, LASER_END + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [LASER_END + 12, LASER_END + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const barWidths = Array.from({ length: NUM_BARS }).map((_, i) => 3 + hash(i) * 6);
  const barHeights = Array.from({ length: NUM_BARS }).map((_, i) => 60 + hash(i + 50) * 80);
  const gap = CARD_W / NUM_BARS;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={GROWTH_END} durationInFrames={8} layout="none">
        <Audio src={sfxLaser()} volume={0.15} />
      </Sequence>
      <Sequence from={LASER_END} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(760, 0.1)} volume={0.15} />
      </Sequence>

      {scene.barcodeLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.barcodeLabel}
        </div>
      )}

      <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`}>
        <rect x={0} y={0} width={CARD_W} height={CARD_H} fill="#f4f4f0" rx={6} />
        {barWidths.map((w, i) => {
          const growFrom = i * 2;
          const h = interpolate(frame, [growFrom, growFrom + 10], [0, barHeights[i]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x = i * gap + gap / 2 - w / 2;
          return <rect key={i} x={x} y={CARD_H / 2 - h / 2} width={w} height={h} fill="#111" />;
        })}

        <line x1={0} y1={laserY} x2={CARD_W} y2={laserY} stroke="#ff2b2b" strokeWidth={2.5} opacity={laserOp}
              style={{ filter: "drop-shadow(0 0 8px #ff2b2b)" }} />
      </svg>

      {scene.barcodeValue && (
        <div style={{ opacity: valueOp, fontSize: 48, fontWeight: 800, color: accent, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.barcodeValue}
        </div>
      )}

      {scene.barcodeNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.barcodeNote}
        </div>
      )}
    </div>
  );
};
