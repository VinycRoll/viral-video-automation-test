import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";

const Half: React.FC<{ label?: string; value?: string; accent: string; from: "left" | "right"; highlight?: boolean }> = ({
  label, value, accent, from, highlight,
}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [6, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [6, 20], [from === "left" ? -40 : 40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{ flex: 1, opacity: op, transform: `translateX(${x}px)`, display: "flex",
                  flexDirection: "column", alignItems: "center", gap: 14, padding: "0 20px" }}>
      {label && (
        <div style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase",
                      letterSpacing: 1, textAlign: "center" }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: 56, fontWeight: 900, color: highlight ? accent : "#fff", textAlign: "center",
                    letterSpacing: -1.5, textShadow: highlight ? `0 0 28px ${accent}50, ${SOFT_TEXT_SHADOW}` : SOFT_TEXT_SHADOW }}>
        {value}
      </div>
    </div>
  );
};

// Comparação lado a lado (antes/depois, opção A/B) com divisória central, sem foto de
// fundo. Usado quando o roteiro compara dois ESTADOS ou MOMENTOS diferentes (ex: "seu
// salário com e sem imposto", "sem reserva vs com reserva") — mais direto que "scale"
// (que faz a balança pender pra um lado); aqui os dois valores só são exibidos lado a
// lado, sem indicar vencedor.
export const SplitScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerOp = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOp = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 40 }}>
      {scene.splitLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "#fff",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.splitLabel}
        </div>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        <Half label={scene.splitLeftLabel} value={scene.splitLeftValue} accent={accent} from="left" />
        <div style={{ width: 2, height: 90, background: "rgba(255,255,255,0.2)", opacity: dividerOp }} />
        <Half label={scene.splitRightLabel} value={scene.splitRightValue} accent={accent} from="right" highlight />
      </div>

      {scene.splitNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW, padding: "0 60px" }}>
          {scene.splitNote}
        </div>
      )}
    </div>
  );
};
