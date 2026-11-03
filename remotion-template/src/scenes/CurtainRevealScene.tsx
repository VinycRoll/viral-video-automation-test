import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxWhoosh, sfxSuccess } from "../utils/soundSynth";

const OPEN_START = 14;
const PANEL_W = 220;

// Duas metades de cortina que se abrem do centro pras laterais com física de balanço
// (overshoot), revelando o conteúdo principal no fundo. Use pra REVELAÇÃO teatral de
// algo importante.
export const CurtainRevealScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const openP = spring({ fps, frame: frame - OPEN_START, config: { damping: 9, stiffness: 55 } });
  const slide = interpolate(openP, [0, 1], [0, PANEL_W + 60]);

  const titleOp = interpolate(frame, [OPEN_START + 16, OPEN_START + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [OPEN_START + 34, OPEN_START + 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pleats = Array.from({ length: 6 });

  const panelStyle: React.CSSProperties = {
    position: "absolute", top: 0, bottom: 0, width: PANEL_W, background: "#3b0a14",
    boxShadow: "0 0 30px rgba(0,0,0,0.5) inset", overflow: "hidden",
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {scene.curtainLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.curtainLabel}
        </div>
      )}

      <div style={{ position: "relative", width: 320, height: 420, overflow: "hidden", borderRadius: 16 }}>
        {scene.curtainTitle && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
                        opacity: titleOp, fontSize: 40, fontWeight: 900, fontFamily: SERIF_FONT, color: "var(--ink)",
                        textAlign: "center", padding: "0 20px", textShadow: SOFT_TEXT_SHADOW }}>
            {scene.curtainTitle}
          </div>
        )}

        <div style={{ ...panelStyle, left: 0, transform: `translateX(${-slide}px)` }}>
          {pleats.map((_, i) => (
            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: (i * PANEL_W) / 6,
                                   width: 2, background: "var(--ink-08)" }} />
          ))}
        </div>
        <div style={{ ...panelStyle, right: 0, transform: `translateX(${slide}px)` }}>
          {pleats.map((_, i) => (
            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: (i * PANEL_W) / 6,
                                   width: 2, background: "var(--ink-08)" }} />
          ))}
        </div>
      </div>

      {scene.curtainNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.curtainNote}
        </div>
      )}

      <Sequence from={OPEN_START} durationInFrames={30} layout="none">
        <Audio src={sfxWhoosh(1)} volume={0.14} />
      </Sequence>
      <Sequence from={OPEN_START + 16} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
    </div>
  );
};
