import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxStatic } from "../utils/soundSynth";

const CONT_W = 300;
const CARD_W = 240;
const CARD_H = 180;
const SLIT_Y = 220;
const START_Y = 10;
const END_Y = SLIT_Y + 90;
const TRAVEL_FRAMES = 100;
const STRIPS = 6;
const STRIP_W = CARD_W / STRIPS;
const CARD_X = (CONT_W - CARD_W) / 2;

// Folha que desce por uma fenda horizontal e sai fatiada em tiras verticais que se
// espalham conforme atravessa. Use pra DESTRUIÇÃO de informação, descarte ou
// eliminação de algo (documentos, provas, dívidas pagas).
export const PaperShredderScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardY = interpolate(frame, [0, TRAVEL_FRAMES], [START_Y, END_Y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const intactHeight = Math.max(0, Math.min(CARD_H, SLIT_Y - cardY));
  const stripTop = Math.max(cardY, SLIT_Y);
  const stripBottom = cardY + CARD_H;
  const stripHeight = Math.max(0, stripBottom - stripTop);
  const spreadFactor = interpolate(cardY, [SLIT_Y - CARD_H, END_Y], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const noteOp = interpolate(frame, [TRAVEL_FRAMES + 10, TRAVEL_FRAMES + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardFace: React.CSSProperties = {
    width: CARD_W, height: CARD_H, background: "#f3ead9", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800,
    color: "#2a2a2a", textAlign: "center", padding: "0 14px", boxSizing: "border-box",
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.shredderLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.shredderLabel}
        </div>
      )}

      <div style={{ position: "relative", width: CONT_W, height: 420 }}>
        {intactHeight > 0 && (
          <div style={{ position: "absolute", left: CARD_X, top: cardY, width: CARD_W, height: intactHeight,
                        overflow: "hidden", borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
            <div style={cardFace}>{scene.shredderTitle}</div>
          </div>
        )}

        {stripHeight > 0 && Array.from({ length: STRIPS }).map((_, i) => {
          const offset = (i - (STRIPS - 1) / 2) * spreadFactor * 16;
          const rotation = (i - (STRIPS - 1) / 2) * spreadFactor * 6;
          return (
            <div key={i} style={{ position: "absolute", left: CARD_X + i * STRIP_W + offset, top: stripTop,
                                   width: STRIP_W, height: stripHeight, overflow: "hidden",
                                   transform: `rotate(${rotation}deg)`, transformOrigin: "top center" }}>
              <div style={{ position: "absolute", left: -i * STRIP_W, top: -(stripTop - cardY), ...cardFace }}>
                {scene.shredderTitle}
              </div>
            </div>
          );
        })}

        <div style={{ position: "absolute", left: -20, right: -20, top: SLIT_Y - 11, height: 22,
                      background: "#121212", boxShadow: `0 0 14px ${accent}50`, borderRadius: 4 }} />
      </div>

      {scene.shredderNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.shredderNote}
        </div>
      )}

      {[10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90].map((f) => (
        <Sequence key={f} from={f} durationInFrames={8} layout="none">
          <Audio src={sfxStatic()} volume={0.1} />
        </Sequence>
      ))}
    </div>
  );
};
