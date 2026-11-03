import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Sequence, Audio } from "remotion";
import { Scene } from "../types";
import { sfxBeep } from "../utils/soundSynth";
import "./native-ui.css";

const PHONE_S = 1.42; // altura do phone ~0.63 da tela (1210px de 1920), igual à referência motionmaxxing

// Notificação sobre a lock screen (estilo native-ui/motionmaxxing): a notificação mais
// recente "chega" deslizando de baixo, depois a câmera avança até ela virar o quadro.
// Sem foto de fundo — mesmo motivo de "proof"/"growth": a UI é o visual.
export const NotificationScene: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(scene.duration * fps);

  const arriveStart = Math.round(fps * 0.3);
  const arriveFrames = Math.round(fps * 0.45);
  const pushStart = Math.round(total * 0.4);
  const pushEnd = Math.round(total * 0.8);

  const arriveP = interpolate(frame, [arriveStart, arriveStart + arriveFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const newestOffsetY = interpolate(arriveP, [0, 1], [260, 0]);

  const pushT = interpolate(frame, [pushStart, pushEnd], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
  });
  const pushScale = interpolate(pushT, [0, 1], [1, 1.85]);
  const idleDrift = 1 + Math.sin(frame / 40) * 0.01; // nunca congela, mesmo antes/depois do push

  const wallpaper = scene.wallpaper
    || `radial-gradient(120% 70% at 20% 10%, ${accent}33 0%, transparent 56%), linear-gradient(172deg,#241d52,#0c0a1c)`;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Sequence from={arriveStart} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1100, 0.08)} volume={0.18} />
      </Sequence>
      <Sequence from={arriveStart + 7} durationInFrames={6} layout="none">
        <Audio src={sfxBeep(1400, 0.08)} volume={0.18} />
      </Sequence>
      <div
        className="nu"
        style={{
          "--s": PHONE_S,
          transform: `scale(${pushScale * idleDrift})`,
          transformOrigin: "50% 76%",
        } as React.CSSProperties}
      >
        <div className="nu-phone">
          <div className="nu-screen">
            <div className="nu-lock" style={{ background: wallpaper }}>
              {scene.lockDate && <div className="nu-lock-date">{scene.lockDate}</div>}
              <div className="nu-lock-time">{scene.lockTime || "9:41"}</div>
              <div className="nu-lock-stack">
                {scene.notifOlderTitle && scene.notifOlderBody && (
                  <div className="nu-notif">
                    <AppIcon letter={scene.notifAppLetter} color={scene.notifAppColor} accent={accent} />
                    <div className="nu-notif-main">
                      <div className="nu-notif-top">
                        <span className="nu-notif-title">{scene.notifOlderTitle}</span>
                        <span className="nu-notif-time">{scene.notifOlderTime || "8m"}</span>
                      </div>
                      <div className="nu-notif-body">{scene.notifOlderBody}</div>
                    </div>
                  </div>
                )}
                {scene.notifTitle && scene.notifBody && (
                  <div className="nu-notif" style={{ transform: `translateY(${newestOffsetY}px)` }}>
                    <AppIcon letter={scene.notifAppLetter} color={scene.notifAppColor} accent={accent} />
                    <div className="nu-notif-main">
                      <div className="nu-notif-top">
                        <span className="nu-notif-title">{scene.notifTitle}</span>
                        <span className="nu-notif-time">{scene.notifTime || "agora"}</span>
                      </div>
                      <div className="nu-notif-body">{scene.notifBody}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="nu-island" />
            <div className="nu-home" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AppIcon: React.FC<{ letter?: string; color?: string; accent: string }> = ({ letter, color, accent }) => (
  <div className="nu-icon" style={{ "--isz": 38, background: color || accent } as React.CSSProperties}>
    {(letter || "A").slice(0, 2).toUpperCase()}
  </div>
);
