import React from "react";
import { useCurrentFrame, interpolate, spring, Sequence, Audio } from "remotion";
import { useVideoConfig } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxImpact, sfxSuccess } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const REEL_W = 120;
const REEL_H = 180;
const STOP_FRAMES = [40, 58, 76];
const DIGIT_H = 60;

// Três "caça-níquel" giram e travam em sequência, revelando um valor raro no final —
// use pra ilustrar probabilidade/chance improvável, diferente de "slotmachine" sendo
// a única cena com mecânica de sorteio girando até parar.
export const SlotMachineScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const resultStart = STOP_FRAMES[2] + 10;
  const resultP = spring({ fps, frame: frame - resultStart, config: { damping: 12, stiffness: 160 } });
  const noteOp = interpolate(frame, [resultStart + 20, resultStart + 32], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      {STOP_FRAMES.map((stopFrame, i) => (
        <Sequence key={`tick-${i}`} from={Math.max(0, stopFrame - 10)} durationInFrames={4} layout="none">
          <Audio src={sfxTick()} volume={0.1} />
        </Sequence>
      ))}
      {STOP_FRAMES.map((stopFrame, i) => (
        <Sequence key={`impact-${i}`} from={stopFrame} durationInFrames={13} layout="none">
          <Audio src={sfxImpact()} volume={0.18} />
        </Sequence>
      ))}
      <Sequence from={resultStart} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.2} />
      </Sequence>
      {scene.slotLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.slotLabel}
        </div>
      )}

      <div style={{ display: "flex", gap: 20 }}>
        {STOP_FRAMES.map((stopFrame, i) => {
          const progress = interpolate(frame, [0, stopFrame], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const eased = 1 - Math.pow(1 - progress, 3);
          const speed = interpolate(eased, [0, 1], [1.4, 0]);
          const offset = (frame * speed * 14) % (DIGIT_H * 10);
          const digits = Array.from({ length: 12 }).map((_, d) => (d * 7 + i * 3) % 10);
          return (
            <div key={i} style={{
              width: REEL_W, height: REEL_H, borderRadius: 14, overflow: "hidden",
              background: "var(--ink-08)", border: "2px solid var(--ink-25)",
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: -offset, left: 0, width: "100%" }}>
                {digits.map((d, k) => (
                  <div key={k} style={{
                    height: DIGIT_H, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 44, fontWeight: 800, color: "var(--ink)", fontFamily: SERIF_FONT,
                  }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {scene.slotValue && (
        <div style={{
          opacity: interpolate(resultP, [0, 1], [0, 1]),
          transform: `scale(${interpolate(resultP, [0, 1], [0.6, 1])})`,
          fontSize: 44, fontWeight: 800, color: accent, textAlign: "center",
          fontFamily: SERIF_FONT, textShadow: SOFT_TEXT_SHADOW,
        }}>
          {scene.slotValue}
        </div>
      )}

      {scene.slotNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.slotNote}
        </div>
      )}
    </div>
  );
};
