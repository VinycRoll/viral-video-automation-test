import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT, BlurReveal } from "../utils/text";
import { sfxWhoosh, sfxResonance } from "../utils/soundSynth";

export const IntroScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const channelOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const channelY  = interpolate(frame, [0, 15], [-30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const tp = spring({ fps, frame: frame - 10, config: { damping: 14, stiffness: 120 } });
  const titleY  = interpolate(tp, [0, 1], [60, 0]);
  const titleOp = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOp = interpolate(frame, [24, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY  = interpolate(frame, [24, 38], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const lineW = interpolate(frame, [32, 52], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "flex-start", justifyContent: "center", padding: "60px 80px", boxSizing: "border-box" }}>
      {scene.channel && (
        <div style={{ opacity: channelOp, transform: `translateY(${channelY}px)`, fontSize: 28,
                      fontWeight: 700, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>
          {scene.channel}
        </div>
      )}

      <Sequence from={0} durationInFrames={10} layout="none">
        <Audio src={sfxWhoosh(0.3)} volume={0.14} />
      </Sequence>
      <Sequence from={0} durationInFrames={23} layout="none">
        <Audio src={sfxResonance(300, 0.7)} volume={0.12} />
      </Sequence>

      <div style={{ width: `${lineW}%`, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, marginBottom: 28 }} />

      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontSize: 76, fontWeight: 700,
                    fontFamily: SERIF_FONT, color: "var(--ink)", lineHeight: 1.15, letterSpacing: -0.5, maxWidth: "90%",
                    marginBottom: 20, textShadow: SOFT_TEXT_SHADOW }}>
        <BlurReveal text={scene.title || ""} startFrame={10} />
      </div>

      {scene.subtitle && (
        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, fontSize: 32,
                      fontWeight: 500, color: "var(--ink-65)", maxWidth: "85%" }}>
          {scene.subtitle}
        </div>
      )}
    </div>
  );
};
