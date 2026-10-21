import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { VideoScript, Scene } from "./types";
import { IntroScene }     from "./scenes/IntroScene";
import { TextScene }      from "./scenes/TextScene";
import { CardScene }      from "./scenes/CardScene";
import { HighlightScene } from "./scenes/HighlightScene";
import { ListScene }      from "./scenes/ListScene";
import { OutroScene }     from "./scenes/OutroScene";

const TRANSITION_FRAMES = 6; // 0.2s @ 30fps — fade rápido entre cenas
const KEN_BURNS_HALF_CYCLE = 90; // 3s @ 30fps — tempo até atingir o zoom/pan máximo

// Legenda estática — fallback para cenas sem timing por palavra (scene.words)
const Caption: React.FC<{ text: string; accent: string; captionFrames: number }> = ({ text, accent, captionFrames }) => {
  const frame = useCurrentFrame();
  const fadeLen = Math.min(8, Math.floor(captionFrames / 4));
  const opacity = interpolate(
    frame,
    [0, fadeLen, captionFrames - fadeLen, captionFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div style={{ position: "absolute", bottom: 160, left: 24, right: 24, opacity, textAlign: "center" }}>
      <span style={{
        display: "inline-block", fontSize: 40, fontWeight: 900, color: "#ffffff",
        lineHeight: 1.3, letterSpacing: 0.2, textTransform: "uppercase",
        textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)",
      }}>{text}</span>
    </div>
  );
};

// Legenda karaokê — todas as palavras da cena visíveis, a palavra atual
// acende na cor de destaque e dá um "pop" de escala conforme o áudio avança
const KaraokeCaption: React.FC<{ words: Scene["words"]; accent: string; captionFrames: number }> = ({ words, accent, captionFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fadeLen = Math.min(6, Math.floor(captionFrames / 6));
  const opacity = interpolate(
    frame,
    [0, fadeLen, captionFrames - fadeLen, captionFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{
      position: "absolute", bottom: 160, left: 40, right: 40, opacity,
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      rowGap: 8, columnGap: 14, textAlign: "center",
    }}>
      {(words || []).map((w, i) => {
        const active = t >= w.start && t < w.end;
        const attack = spring({
          fps, frame: frame - Math.round(w.start * fps),
          config: { damping: 10, stiffness: 260 }, durationInFrames: 10,
        });
        const scale = active ? interpolate(attack, [0, 1], [1, 1.22]) : 1;
        return (
          <span key={i} style={{
            display: "inline-block", fontSize: 44, fontWeight: 900, textTransform: "uppercase",
            color: active ? accent : "rgba(255,255,255,0.92)",
            transform: `scale(${scale})`,
            textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)",
          }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// Fundo animado — gradiente roxo/azul escuro com glow suave
const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hue = interpolate(frame, [0, fps * 60], [255, 275], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 40%, hsl(${hue},55%,11%) 0%, #07070f 70%)` }}>
      {[
        { x: 15, y: 20, s: 200 }, { x: 75, y: 15, s: 150 },
        { x: 45, y: 70, s: 180 }, { x: 85, y: 55, s: 120 },
        { x: 25, y: 80, s: 160 },
      ].map(({ x, y, s }, i) => {
        const drift = interpolate(Math.sin((frame / (fps * 7)) * Math.PI * 2 + i), [-1, 1], [-6, 6]);
        return (
          <div key={i} style={{ position: "absolute", left: `${x}%`, top: `calc(${y}% + ${drift}px)`,
                                width: s, height: s, borderRadius: "50%", transform: "translate(-50%,-50%)",
                                background: `radial-gradient(circle, ${accent}09 0%, transparent 70%)` }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Partículas sutis — pontinhos de luz subindo lentamente, dão profundidade ao fundo
const PARTICLE_SEEDS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 2 + (i % 4),
  speed: 0.4 + (i % 5) * 0.15,
  phase: i * 0.6,
}));

const Particles: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {PARTICLE_SEEDS.map((p, i) => {
        const cycle = fps * 8; // sobe e recicla a cada ~8s
        const localFrame = (frame + p.phase * cycle) % cycle;
        const y = 100 - interpolate(localFrame, [0, cycle], [0, 100]);
        const opacity = interpolate(localFrame, [0, cycle * 0.15, cycle * 0.85, cycle], [0, 0.35, 0.35, 0]);
        return (
          <div key={i} style={{
            position: "absolute", left: `${p.x}%`, top: `${y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: accent, opacity, filter: "blur(0.5px)",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Direções de Ken Burns — cada cena usa uma diferente (zoom in, zoom out, pan
// esquerda/direita, diagonal), atingindo o pico em KEN_BURNS_FRAMES (3s)
const KEN_BURNS_DIRECTIONS = [
  { scaleFrom: 1.00, scaleTo: 1.15, xFrom: 0,  xTo: 0,  yFrom: 0,  yTo: -2 }, // zoom in
  { scaleFrom: 1.15, scaleTo: 1.00, xFrom: 0,  xTo: 0,  yFrom: -2, yTo: 0  }, // zoom out
  { scaleFrom: 1.08, scaleTo: 1.15, xFrom: 4,  xTo: -4, yFrom: 0,  yTo: 0  }, // pan esquerda
  { scaleFrom: 1.08, scaleTo: 1.15, xFrom: -4, xTo: 4,  yFrom: 0,  yTo: 0  }, // pan direita
  { scaleFrom: 1.00, scaleTo: 1.15, xFrom: -4, xTo: 4,  yFrom: -3, yTo: 3  }, // diagonal
];

// Ken Burns — zoom/pan sobre uma imagem de fundo (ComfyUI/Pixabay), direção
// e intensidade variam por cena para não ficar repetitivo.
// Usa um ping-pong senoidal (em vez de interpolate+clamp) porque cenas reais
// quase sempre duram mais que KEN_BURNS_HALF_CYCLE (a duração é esticada para
// caber o áudio da narração) — com clamp, o movimento atingia o pico em 3s e
// depois congelava pelo resto da cena, parecendo uma imagem estática.
const KenBurnsImage: React.FC<{ src: string; index: number }> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const dir = KEN_BURNS_DIRECTIONS[index % KEN_BURNS_DIRECTIONS.length];
  const cycle = KEN_BURNS_HALF_CYCLE * 2;
  // t oscila 0 → 1 → 0 continuamente, atingindo 1 (o extremo "To") exatamente
  // em KEN_BURNS_HALF_CYCLE (3s), depois volta suavemente — nunca para.
  const t = (Math.sin((frame / cycle) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const scale = interpolate(t, [0, 1], [dir.scaleFrom, dir.scaleTo]);
  const panX  = interpolate(t, [0, 1], [dir.xFrom, dir.xTo]);
  const panY  = interpolate(t, [0, 1], [dir.yFrom, dir.yTo]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Fundo de cada cena: imagem com Ken Burns (quando houver) ou gradiente animado,
// sempre com partículas sutis e gradiente escuro na base para a legenda respirar
const SceneBackdrop: React.FC<{ scene: Scene; accent: string; index: number }> = ({ scene, accent, index }) => {
  return (
    <>
      {scene.backgroundImage
        ? <KenBurnsImage src={scene.backgroundImage} index={index} />
        : <Background accent={accent} />}
      <Particles accent={accent} />
      <AbsoluteFill style={{
        background: scene.backgroundImage
          ? "linear-gradient(180deg, rgba(5,5,12,0.55) 0%, rgba(5,5,12,0.3) 40%, rgba(5,5,12,0.85) 100%)"
          : "linear-gradient(180deg, rgba(5,5,12,0) 0%, rgba(5,5,12,0) 55%, rgba(5,5,12,0.8) 100%)",
      }} />
    </>
  );
};

// Fade rápido (0.2s) de entrada/saída de cada cena — dá o "corte" entre cenas
const SceneTransitionOverlay: React.FC<{ durationInFrames: number; isFirst: boolean; isLast: boolean }> = ({ durationInFrames, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const inOp  = isFirst ? 0 : interpolate(frame, [0, TRANSITION_FRAMES], [1, 0], { extrapolateRight: "clamp" });
  const outOp = isLast  ? 0 : interpolate(frame, [durationInFrames - TRANSITION_FRAMES, durationInFrames], [0, 1], { extrapolateLeft: "clamp" });
  const opacity = Math.max(inOp, outOp);
  if (opacity <= 0) return null;
  return <AbsoluteFill style={{ background: "#000", opacity, pointerEvents: "none" }} />;
};

// Barra de progresso animada no topo — reflete o avanço no vídeo inteiro
const ProgressBar: React.FC<{ accent: string; totalFrames: number }> = ({ accent, totalFrames }) => {
  const frame = useCurrentFrame();
  const pct = Math.min(100, (frame / Math.max(1, totalFrames)) * 100);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.15)", zIndex: 10 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
    </div>
  );
};

const SceneRouter: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  switch (scene.type) {
    case "intro":     return <IntroScene     scene={scene} accent={accent} />;
    case "text":      return <TextScene      scene={scene} accent={accent} />;
    case "card":      return <CardScene      scene={scene} accent={accent} />;
    case "highlight": return <HighlightScene scene={scene} accent={accent} />;
    case "list":      return <ListScene      scene={scene} accent={accent} />;
    case "outro":     return <OutroScene     scene={scene} accent={accent} />;
    default:          return <TextScene      scene={scene} accent={accent} />;
  }
};

export const MotionReel: React.FC<{ script: VideoScript }> = ({ script }) => {
  const { fps } = useVideoConfig();
  const accent = script.accentColor || "#FFD700";

  const totalFrames = script.scenes.reduce((acc, s) => acc + Math.round(s.duration * fps), 0);

  let offset = 0;
  const visualElements: React.ReactNode[] = [];
  const captionElements: React.ReactNode[] = [];

  script.scenes.forEach((scene, i) => {
    const dur = Math.round(scene.duration * fps);
    const captionFrames = scene.captionFrames ?? dur;
    const from = offset;
    offset += dur;

    // Cena visual: dura só dur (duração da cena)
    visualElements.push(
      <Sequence key={`v${i}`} from={from} durationInFrames={dur}>
        <AbsoluteFill>
          <SceneBackdrop scene={scene} accent={accent} index={i} />
          <SceneRouter scene={scene} accent={accent} />
          <SceneTransitionOverlay durationInFrames={dur} isFirst={i === 0} isLast={i === script.scenes.length - 1} />
        </AbsoluteFill>
      </Sequence>
    );

    // Legenda: Sequence próprio com duração do áudio real (pode ultrapassar a cena)
    if (scene.words && scene.words.length > 0) {
      captionElements.push(
        <Sequence key={`c${i}`} from={from} durationInFrames={captionFrames}>
          <KaraokeCaption words={scene.words} accent={accent} captionFrames={captionFrames} />
        </Sequence>
      );
    } else if (scene.caption) {
      captionElements.push(
        <Sequence key={`c${i}`} from={from} durationInFrames={captionFrames}>
          <Caption text={scene.caption} accent={accent} captionFrames={captionFrames} />
        </Sequence>
      );
    }
  });

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', 'Arial Black', sans-serif" }}>
      {visualElements}
      {captionElements}
      <ProgressBar accent={accent} totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
