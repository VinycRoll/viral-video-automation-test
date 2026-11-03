import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxTick, sfxSuccess } from "../utils/soundSynth";
import { SOFT_TEXT_SHADOW } from "../utils/text";
import { VariantFrame } from "../utils/variant";

// Card de calendário de mesa (estilo native-ui) — usado quando o roteiro cita uma data,
// prazo ou evento específico. O dia "vira" (flip vertical) revelando o número marcado,
// com um anel de destaque pulsando atrás pra marcar a data como importante.
export const CalendarScene: React.FC<{ scene: Scene; accent: string; variant?: number }> = ({ scene, accent, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardP = spring({ fps, frame: frame - 4, config: { damping: 14, stiffness: 130 } });
  const cardScale = interpolate(cardP, [0, 1], [0.8, 1]);
  const cardOp = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // flip: rotateX de -90° (de costas) até 0° (de frente), como uma folha de calendário virando
  const flipStart = 18;
  const flipFrames = 16;
  const flipP = interpolate(frame, [flipStart, flipStart + flipFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const flipDeg = interpolate(flipP, [0, 1], [-90, 0]);
  const dayOpacity = interpolate(flipP, [0, 0.4, 1], [0, 0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ringP = spring({ fps, frame: frame - flipStart - flipFrames, config: { damping: 10, stiffness: 100 } });
  const ringScale = interpolate(ringP, [0, 1], [0.3, 1]);
  const ringOp = interpolate(frame, [flipStart + flipFrames, flipStart + flipFrames + 10], [0, 0.55], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const noteOp = interpolate(frame, [flipStart + flipFrames + 10, flipStart + flipFrames + 24], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 36 }}>
      <Sequence from={flipStart} durationInFrames={4} layout="none">
        <Audio src={sfxTick()} volume={0.14} />
      </Sequence>
      <Sequence from={flipStart + flipFrames} durationInFrames={11} layout="none">
        <Audio src={sfxSuccess()} volume={0.18} />
      </Sequence>
      <VariantFrame variant={variant} accent={accent}>
      <div style={{ opacity: cardOp, transform: `scale(${cardScale})`, width: 360, borderRadius: 28,
                    overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", background: "var(--ink)" }}>
        <div style={{ background: accent, padding: "18px 0", textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 2, color: "#0b0b10" }}>
            {scene.calendarMonth || "MARÇO"}
          </div>
        </div>
        <div style={{ position: "relative", padding: "40px 0 44px", textAlign: "center",
                      perspective: 600 }}>
          <div style={{
            position: "absolute", left: "50%", top: "50%", width: 160, height: 160,
            marginLeft: -80, marginTop: -92, borderRadius: "50%",
            background: accent, opacity: ringOp, transform: `scale(${ringScale})`,
          }} />
          <div style={{ position: "relative", transform: `rotateX(${flipDeg}deg)`, opacity: dayOpacity,
                        transformOrigin: "50% 50%" }}>
            <div style={{ fontSize: 140, fontWeight: 900, lineHeight: 1, color: "#0b0b10",
                          letterSpacing: -4, fontVariantNumeric: "tabular-nums" }}>
              {scene.calendarDay || "01"}
            </div>
          </div>
          {scene.calendarWeekday && (
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: "rgba(10,10,15,0.55)",
                          letterSpacing: 1, textTransform: "uppercase" }}>
              {scene.calendarWeekday}
            </div>
          )}
        </div>
      </div>
      </VariantFrame>

      {scene.calendarNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.calendarNote}
        </div>
      )}
    </div>
  );
};
