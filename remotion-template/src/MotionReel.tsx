import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { VideoScript, Scene } from "./types";
import { IntroScene }     from "./scenes/IntroScene";
import { TextScene }      from "./scenes/TextScene";
import { CardScene }      from "./scenes/CardScene";
import { HighlightScene } from "./scenes/HighlightScene";
import { ListScene }      from "./scenes/ListScene";
import { OutroScene }     from "./scenes/OutroScene";
import { CodeScene }      from "./scenes/CodeScene";
import { ChapterScene, CHAPTER_REVEAL_FRAMES } from "./scenes/ChapterScene";
import { ProofScene }     from "./scenes/ProofScene";
import { GrowthScene }    from "./scenes/GrowthScene";

const TRANSITION_FRAMES = 10; // ~0.33s @ 30fps — duração do crossfade entre cenas
const KEN_BURNS_HALF_CYCLE = 90; // 3s @ 30fps — tempo até atingir o zoom/pan máximo
const COLLAGE_FRAGMENTS = 4; // nº de cópias na transição de fragmentação em cascata

// Hash determinístico simples (mesmo motivo do pseudoRandomChar em text.tsx: precisa
// ser estável entre re-renders do Remotion, não pode usar Math.random()).
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

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
        display: "inline-block", fontSize: 32, fontWeight: 900, color: "#ffffff",
        lineHeight: 1.3, letterSpacing: 0.2, textTransform: "uppercase",
        textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)",
      }}>{text.replace(/\*/g, "")}</span>
    </div>
  );
};

const CAPTION_CHUNK_SIZE = 3; // 2 a 4 palavras na tela por vez, como no vídeo de referência

// Legenda karaokê esparsa — só as palavras do "bloco" atual (até CAPTION_CHUNK_SIZE)
// ficam visíveis, construindo a frase progressivamente; a palavra atual acende na
// cor de destaque e dá um "pop" de escala conforme o áudio avança.
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

  const list = words || [];
  let spokenIdx = -1;
  for (let i = 0; i < list.length; i++) {
    if (list[i].start <= t) spokenIdx = i;
  }
  if (spokenIdx === -1) return null;

  const chunkStart = Math.floor(spokenIdx / CAPTION_CHUNK_SIZE) * CAPTION_CHUNK_SIZE;
  const visibleWords = list.slice(chunkStart, spokenIdx + 1);

  return (
    <div style={{
      position: "absolute", bottom: 160, left: 40, right: 40, opacity,
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      rowGap: 8, columnGap: 14, textAlign: "center",
    }}>
      {visibleWords.map((w, i) => {
        const idx = chunkStart + i;
        const active = t >= w.start && t < w.end;
        // Markdown vazado da narração (*destaque*) — some os asteriscos e mantém
        // a palavra realçada mesmo fora do momento "ativo" do karaokê.
        const marked = /\*/.test(w.text);
        const clean = w.text.replace(/\*/g, "");
        const attack = spring({
          fps, frame: frame - Math.round(w.start * fps),
          config: { damping: 10, stiffness: 260 }, durationInFrames: 10,
        });
        // fontSize (não transform:scale) pro "pop" da palavra ativa — scale é só visual
        // e não reflui os vizinhos, então a palavra maior sobrepunha as ao lado.
        const baseFontSize = 36;
        const fontSize = active ? interpolate(attack, [0, 1], [baseFontSize, baseFontSize * 1.18]) : baseFontSize;
        return (
          <span key={idx} style={{
            display: "inline-block", fontSize, fontWeight: 900, textTransform: "uppercase",
            color: active || marked ? accent : "rgba(255,255,255,0.92)",
            textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 16px rgba(0,0,0,0.65)",
          }}>
            {clean}
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

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
  };
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {isVideo
        ? <OffthreadVideo src={staticFile(src)} style={mediaStyle} muted />
        : <Img src={staticFile(src)} style={mediaStyle} />}
    </AbsoluteFill>
  );
};

// Fundo de cada cena: imagem com Ken Burns (quando houver) ou gradiente animado,
// sempre com partículas sutis e gradiente escuro na base para a legenda respirar
const SceneBackdrop: React.FC<{ scene: Scene; accent: string; index: number }> = ({ scene, accent, index }) => {
  const frame = useCurrentFrame();
  // Rack focus — só nos cards de "abertura de capítulo": o fundo sai de
  // desfocado pra nítido junto com o reveal letra-por-letra do título.
  const rackFocus = scene.type === "chapter";
  const blur = rackFocus
    ? interpolate(frame, [0, CHAPTER_REVEAL_FRAMES], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  return (
    <>
      {scene.backgroundImage
        ? (
          <AbsoluteFill style={{ filter: rackFocus ? `blur(${blur}px)` : undefined }}>
            <KenBurnsImage src={scene.backgroundImage} index={index} />
          </AbsoluteFill>
        )
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

// Corte entre cenas: seco por padrão (sem overlap, como a maioria dos cortes do
// vídeo de referência — disfarçado pelo scramble de entrada que cada título já tem).
// Variante "collage" (raridade ~1 por vídeo, como no vídeo de referência): em vez de
// um corte seco, a cena de saída se fragmenta em cópias sobrepostas que
// encolhem/deslizam/desaparecem em cascata antes do corte — só essa variante estende
// a Sequence além de nominalDur (ver cálculo de durationInFrames no loop principal).
const SceneCrossfade: React.FC<{
  children: React.ReactNode; nominalDur: number; isLast: boolean; variant?: "fade" | "collage";
}> = ({ children, nominalDur, isLast, variant = "fade" }) => {
  const frame = useCurrentFrame();

  if (variant === "collage" && !isLast) {
    const fadeOutProgress = interpolate(frame, [nominalDur, nominalDur + TRANSITION_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOutProgress > 0) {
      return (
        <AbsoluteFill>
          {Array.from({ length: COLLAGE_FRAGMENTS }, (_, i) => {
            const delay = i * 0.12;
            const localP = Math.max(0, Math.min(1, (fadeOutProgress - delay) / (1 - delay)));
            const scale = interpolate(localP, [0, 1], [1, 0.72 - i * 0.08]);
            const tx = interpolate(localP, [0, 1], [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 6)]);
            const ty = interpolate(localP, [0, 1], [0, (i < 2 ? -1 : 1) * (8 + i * 5)]);
            const op = interpolate(localP, [0, 1], [1, 0]);
            return (
              <AbsoluteFill key={i} style={{ opacity: op, transform: `translate(${tx}%, ${ty}%) scale(${scale})` }}>
                {children}
              </AbsoluteFill>
            );
          })}
        </AbsoluteFill>
      );
    }
  }

  return <>{children}</>;
};

// Drift contínuo e sutil no conteúdo da cena (não só no fundo) — garante que
// nenhum frame fique 100% estático mesmo durante uma pausa de leitura longa,
// como no vídeo de referência (/home/vinycius/film). Período e fase variam por
// índice de cena pra não sincronizar visivelmente com o corte.
const AMBIENT_DRIFT_CYCLE = 150; // 5s @30fps
const AmbientDrift: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const frame = useCurrentFrame();
  const phase = (index * 37) % AMBIENT_DRIFT_CYCLE;
  const t = (Math.sin(((frame + phase) / AMBIENT_DRIFT_CYCLE) * Math.PI * 2) + 1) / 2;
  const scale = interpolate(t, [0, 1], [1, 1.015]);
  return <div style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}>{children}</div>;
};

const SceneRouter: React.FC<{ scene: Scene; accent: string }> = ({ scene, accent }) => {
  switch (scene.type) {
    case "intro":     return <IntroScene     scene={scene} accent={accent} />;
    case "text":      return <TextScene      scene={scene} accent={accent} />;
    case "card":      return <CardScene      scene={scene} accent={accent} />;
    case "highlight": return <HighlightScene scene={scene} accent={accent} />;
    case "list":      return <ListScene      scene={scene} accent={accent} />;
    case "code":      return <CodeScene      scene={scene} accentColor={accent} />;
    case "chapter":   return <ChapterScene   scene={scene} accent={accent} />;
    case "proof":     return <ProofScene     scene={scene} accent={accent} />;
    case "growth":    return <GrowthScene    scene={scene} accent={accent} />;
    case "outro":     return <OutroScene     scene={scene} accent={accent} />;
    default:          return <TextScene      scene={scene} accent={accent} />;
  }
};

export const MotionReel: React.FC<{ script: VideoScript }> = ({ script }) => {
  const { fps } = useVideoConfig();
  const accent = script.accentColor || "#FFD700";

  // Exatamente 1 corte em cascata por vídeo (raridade observada no vídeo de
  // referência: apareceu 1x em 8 cortes) — escolhido por hash determinístico do
  // título em vez de um índice fixo, senão vídeos com poucas cenas (comum no
  // pipeline, a maioria tem 5-8) nunca batiam o índice e o efeito nunca aparecia.
  const numCuts = script.scenes.length - 1;
  const collageIndex = numCuts > 0 ? hashString(script.title || "") % numCuts : -1;

  let offset = 0;
  const visualElements: React.ReactNode[] = [];
  const captionElements: React.ReactNode[] = [];

  script.scenes.forEach((scene, i) => {
    const dur = Math.round(scene.duration * fps);
    const captionFrames = scene.captionFrames ?? dur;
    const isLast = i === script.scenes.length - 1;
    const from = offset;
    offset += dur;

    const variant: "fade" | "collage" = !isLast && i === collageIndex ? "collage" : "fade";

    // Cena visual: só estende além de "dur" na variante collage (pra sobrepor com a
    // próxima durante a cascata) — as demais são corte seco, sem overlap.
    const extend = !isLast && variant === "collage";
    visualElements.push(
      <Sequence key={`v${i}`} from={from} durationInFrames={extend ? dur + TRANSITION_FRAMES : dur}>
        <SceneCrossfade nominalDur={dur} isLast={isLast} variant={variant}>
          <AbsoluteFill>
            <SceneBackdrop scene={scene} accent={accent} index={i} />
            <AmbientDrift index={i}>
              <SceneRouter scene={scene} accent={accent} />
            </AmbientDrift>
          </AbsoluteFill>
        </SceneCrossfade>
      </Sequence>
    );

    // Legenda: Sequence próprio com duração do áudio real (pode ultrapassar a cena).
    // HighlightScene já mostra a frase inteira na tela (seu "text"), então qualquer
    // legenda por cima (karaokê OU o bloco estático de fallback) duplicaria o mesmo
    // espaço visual — pulamos as duas variantes só nesse tipo de cena.
    if (scene.type !== "highlight" && scene.words && scene.words.length > 0) {
      captionElements.push(
        <Sequence key={`c${i}`} from={from} durationInFrames={captionFrames}>
          <KaraokeCaption words={scene.words} accent={accent} captionFrames={captionFrames} />
        </Sequence>
      );
    } else if (scene.type !== "highlight" && scene.caption) {
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
    </AbsoluteFill>
  );
};
