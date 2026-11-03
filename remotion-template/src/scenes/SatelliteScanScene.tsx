import React from "react";
import { useCurrentFrame, interpolate, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { SOFT_TEXT_SHADOW, SERIF_FONT } from "../utils/text";
import { sfxLaser, sfxBeep } from "../utils/soundSynth";

const WIDTH = 320;
const HEIGHT = 380;
const SAT_X = WIDTH / 2;
const SAT_Y = 50;
const TERRAIN_Y = 300;
const TERRAIN_H = 40;
const TARGET_X = WIDTH / 2 + 60;

// Satélite disparando um feixe cônico que varre uma superfície abaixo, destacando
// em verde brilhante um ponto específico quando o feixe passa por ele. Use pra
// VIGILÂNCIA, descoberta ou monitoramento à distância.
export const SatelliteScanScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sweepAngle = Math.sin(frame * 0.045) * 32;
  const beamXAtTerrain = SAT_X + Math.tan((sweepAngle * Math.PI) / 180) * (TERRAIN_Y - SAT_Y);
  const beamHalfWidthAtTerrain = 60;
  const leftX = beamXAtTerrain - beamHalfWidthAtTerrain;
  const rightX = beamXAtTerrain + beamHalfWidthAtTerrain;

  const diff = Math.abs(beamXAtTerrain - TARGET_X);
  const proximity = interpolate(diff, [0, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const noteOp = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // mesma fórmula de sweepAngle/beamXAtTerrain/proximity que dirige o feixe visual,
  // usada aqui só pra achar os frames onde o feixe entra na zona do alvo (detecção).
  const detectFrames: number[] = [];
  let wasClose = false;
  for (let f = 0; f <= 300; f++) {
    const sa = Math.sin(f * 0.045) * 32;
    const bx = SAT_X + Math.tan((sa * Math.PI) / 180) * (TERRAIN_Y - SAT_Y);
    const d = Math.abs(bx - TARGET_X);
    const isClose = d < 28;
    if (isClose && !wasClose) detectFrames.push(f);
    wasClose = isClose;
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 32, padding: "0 60px", boxSizing: "border-box" }}>
      <Sequence from={0} durationInFrames={8} layout="none">
        <Audio src={sfxLaser()} volume={0.12} />
      </Sequence>
      {detectFrames.map((df) => (
        <Sequence key={df} from={df} durationInFrames={6} layout="none">
          <Audio src={sfxBeep(1200, 0.08)} volume={0.14} />
        </Sequence>
      ))}

      {scene.satelliteLabel && (
        <div style={{ opacity: labelOp, fontSize: 30, fontWeight: 700, fontFamily: SERIF_FONT, color: "var(--ink)",
                      textAlign: "center", letterSpacing: -0.3, textShadow: SOFT_TEXT_SHADOW }}>
          {scene.satelliteLabel}
        </div>
      )}

      <svg width={WIDTH * 0.85} height={HEIGHT * 0.85} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <polygon points={`${SAT_X},${SAT_Y} ${leftX},${TERRAIN_Y} ${rightX},${TERRAIN_Y}`} fill={accent} opacity={0.18} />

        <rect x={SAT_X - 26} y={SAT_Y - 6} width={10} height={12} fill="var(--ink-5)" />
        <rect x={SAT_X + 16} y={SAT_Y - 6} width={10} height={12} fill="var(--ink-5)" />
        <rect x={SAT_X - 10} y={SAT_Y - 8} width={20} height={16} rx={2} fill="#dcdcdc" />

        <rect x={0} y={TERRAIN_Y} width={WIDTH} height={TERRAIN_H} fill="var(--ink-08)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={(i * WIDTH) / 9} y1={TERRAIN_Y} x2={(i * WIDTH) / 9} y2={TERRAIN_Y + TERRAIN_H}
                stroke="var(--ink-12)" strokeWidth={1} />
        ))}

        <circle cx={TARGET_X} cy={TERRAIN_Y + TERRAIN_H / 2} r={10 + proximity * 6} fill="#3df562"
                opacity={0.3 + proximity * 0.7} style={{ filter: proximity > 0.3 ? "drop-shadow(0 0 14px #3df562)" : "none" }} />

        {proximity > 0.3 && scene.satelliteTargetLabel && (
          <text x={TARGET_X} y={TERRAIN_Y + TERRAIN_H + 24} fill="#3df562" fontSize={16} fontWeight={700} textAnchor="middle" opacity={proximity}>
            {scene.satelliteTargetLabel}
          </text>
        )}
      </svg>

      {scene.satelliteNote && (
        <div style={{ opacity: noteOp, fontSize: 34, fontWeight: 800, color: accent,
                      textAlign: "center", textTransform: "uppercase", letterSpacing: 1,
                      textShadow: SOFT_TEXT_SHADOW }}>
          {scene.satelliteNote}
        </div>
      )}
    </div>
  );
};
