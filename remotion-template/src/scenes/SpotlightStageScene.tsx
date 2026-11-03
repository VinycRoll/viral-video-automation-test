import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxImpact, sfxWhoosh } from "../utils/soundSynth";

const W = 340;
const H = 500;
const CROSS_FRAME = 75;

// Dois cones de holofote passeando num fundo escuro até se cruzarem no centro,
// iluminando o que estava escondido. Use pra DESTAQUE ou revelação dramática de algo
// em evidência.
export const SpotlightStageScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const amplitude = interpolate(frame, [0, CROSS_FRAME], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const baseX1 = W / 2 + amplitude * Math.sin(frame * 0.09);
  const baseX2 = W / 2 - amplitude * Math.sin(frame * 0.11 + 1.1);

  const titleOp = interpolate(frame, [CROSS_FRAME, CROSS_FRAME + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowOp = interpolate(frame, [CROSS_FRAME, CROSS_FRAME + 20], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [CROSS_FRAME + 20, CROSS_FRAME + 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cone = (baseX: number, key: string) => (
    <polygon key={key} points={`${W / 2},-10 ${baseX - 90},${H} ${baseX + 90},${H}`}
             fill="var(--ink-22)" style={{ filter: "blur(18px)" }} />
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={13} layout="none">
        <Audio src={sfxImpact(0.2)} volume={0.2} />
      </Sequence>
      <Sequence from={10} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.3)} volume={0.14} />
      </Sequence>
      {scene.spotlightLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.spotlightLabel}
        </div>
      )}

      <div style={{ position: "relative", width: W, height: H, background: "#05050a", borderRadius: 16, overflow: "hidden" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {cone(baseX1, "a")}
          {cone(baseX2, "b")}
        </svg>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                      width: 260, height: 260, borderRadius: "50%",
                      background: `radial-gradient(circle, ${accent}${Math.round(glowOp * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)` }} />
        {scene.spotlightTitle && (
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                        opacity: titleOp, fontSize: 40, fontWeight: 900, fontFamily: SERIF_FONT, color: "var(--ink)",
                        textAlign: "center", padding: "0 20px", textShadow: SOFT_TEXT_SHADOW }}>
            {scene.spotlightTitle}
          </div>
        )}
      </div>

      {scene.spotlightNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.spotlightNote}
        </div>
      )}
    </div>
  );
};
