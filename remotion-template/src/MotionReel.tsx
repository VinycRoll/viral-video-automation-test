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
import { NotificationScene } from "./scenes/NotificationScene";
import { CalendarScene }     from "./scenes/CalendarScene";
import { ClockScene }        from "./scenes/ClockScene";
import { MoneyStackScene }   from "./scenes/MoneyStackScene";
import { ChecklistScene }    from "./scenes/ChecklistScene";
import { ProgressScene }     from "./scenes/ProgressScene";
import { TimerScene }        from "./scenes/TimerScene";
import { RatingScene }       from "./scenes/RatingScene";
import { ScaleScene }        from "./scenes/ScaleScene";
import { MapScene }          from "./scenes/MapScene";
import { WeatherScene }      from "./scenes/WeatherScene";
import { AchievementScene }  from "./scenes/AchievementScene";
import { BatteryScene }      from "./scenes/BatteryScene";
import { BookScene }         from "./scenes/BookScene";
import { pickVariant }       from "./utils/variant";
import { ThermometerScene }  from "./scenes/ThermometerScene";
import { PiggyBankScene }    from "./scenes/PiggyBankScene";
import { ReceiptScene }      from "./scenes/ReceiptScene";
import { RoadmapScene }      from "./scenes/RoadmapScene";
import { QuoteScene }        from "./scenes/QuoteScene";
import { AlertScene }        from "./scenes/AlertScene";
import { SplitScene }        from "./scenes/SplitScene";
import { CounterScene }      from "./scenes/CounterScene";
import { SizeComparisonScene } from "./scenes/SizeComparisonScene";
import { AnatomyXRayScene }    from "./scenes/AnatomyXRayScene";
import { ProportionGridScene } from "./scenes/ProportionGridScene";
import { SpeedRaceScene }      from "./scenes/SpeedRaceScene";
import { TimelineEraScene }    from "./scenes/TimelineEraScene";
import { SolarOrbitScene }     from "./scenes/SolarOrbitScene";
import { DNAStrandScene }      from "./scenes/DNAStrandScene";
import { MythVsFactScene }     from "./scenes/MythVsFactScene";
import { RedactedDocScene }    from "./scenes/RedactedDocScene";
import { MagnifyingGlassScene } from "./scenes/MagnifyingGlassScene";
import { CensoredRevealScene } from "./scenes/CensoredRevealScene";
import { DominoEffectScene }   from "./scenes/DominoEffectScene";
import { TreeBranchScene }     from "./scenes/TreeBranchScene";
import { VsBattleScene }       from "./scenes/VsBattleScene";
import { BrainSynapseScene }   from "./scenes/BrainSynapseScene";
import { HeartbeatECGScene }   from "./scenes/HeartbeatECGScene";
import { OpticalIllusionScene } from "./scenes/OpticalIllusionScene";
import { SoundWaveScene }      from "./scenes/SoundWaveScene";
import { DepthOceanScene }     from "./scenes/DepthOceanScene";
import { PressureCrushScene }  from "./scenes/PressureCrushScene";
import { ChainReactionScene }  from "./scenes/ChainReactionScene";
import { PendulumWaveScene }   from "./scenes/PendulumWaveScene";
import { SlotMachineScene }    from "./scenes/SlotMachineScene";
import { LabFlaskMixScene }    from "./scenes/LabFlaskMixScene";
import { PyramidHierarchyScene } from "./scenes/PyramidHierarchyScene";
import { SupplyChainScene }    from "./scenes/SupplyChainScene";
import { PopulationCrowdScene } from "./scenes/PopulationCrowdScene";
import { BalanceBeamScene }    from "./scenes/BalanceBeamScene";
import { GlitchSystemScene }   from "./scenes/GlitchSystemScene";
import { RadarSonarScene }     from "./scenes/RadarSonarScene";
import { EvolutionMorphScene } from "./scenes/EvolutionMorphScene";
import { MicroscopeZoomScene } from "./scenes/MicroscopeZoomScene";
import { TelescopeStarScene }  from "./scenes/TelescopeStarScene";
import { BlueprintDraftScene } from "./scenes/BlueprintDraftScene";
import { VortexBlackHoleScene } from "./scenes/VortexBlackHoleScene";
import { ChessStrategyScene }  from "./scenes/ChessStrategyScene";
import { MorseSignalScene }    from "./scenes/MorseSignalScene";
import { HourglassSandScene }  from "./scenes/HourglassSandScene";
import { SatelliteScanScene }  from "./scenes/SatelliteScanScene";
import { BarcodePriceScene }   from "./scenes/BarcodePriceScene";
import { StampApprovalScene }  from "./scenes/StampApprovalScene";
import { MetronomeSwingScene } from "./scenes/MetronomeSwingScene";
import { CompassNeedleScene }  from "./scenes/CompassNeedleScene";
import { LiquidFillScene }     from "./scenes/LiquidFillScene";
import { RadioTunerScene }     from "./scenes/RadioTunerScene";
import { SpotlightStageScene } from "./scenes/SpotlightStageScene";
import { PaperShredderScene }  from "./scenes/PaperShredderScene";
import { MagneticPolesScene }  from "./scenes/MagneticPolesScene";
import { CircuitBoardScene }   from "./scenes/CircuitBoardScene";
import { ShatterGlassScene }   from "./scenes/ShatterGlassScene";
import { CurtainRevealScene }  from "./scenes/CurtainRevealScene";
import { BombFuseScene }       from "./scenes/BombFuseScene";
import { KaleidoscopeMorphScene } from "./scenes/KaleidoscopeMorphScene";
import { AbacusBeadsScene }    from "./scenes/AbacusBeadsScene";
import { ArchimedesLeverScene } from "./scenes/ArchimedesLeverScene";
import { CardHouseCollapseScene } from "./scenes/CardHouseCollapseScene";
import { CentrifugeSpinScene }  from "./scenes/CentrifugeSpinScene";
import { ChromatographySpreadScene } from "./scenes/ChromatographySpreadScene";
import { CoinTossFlipScene }    from "./scenes/CoinTossFlipScene";
import { ConveyorBeltSortScene } from "./scenes/ConveyorBeltSortScene";
import { CubeUnfoldScene }      from "./scenes/CubeUnfoldScene";
import { CuckooPendulumScene }  from "./scenes/CuckooPendulumScene";
import { DecibelMeterScene }    from "./scenes/DecibelMeterScene";
import { DialSafeCombinationScene } from "./scenes/DialSafeCombinationScene";
import { DropletRippleScene }   from "./scenes/DropletRippleScene";
import { ElevatorFloorScene }   from "./scenes/ElevatorFloorScene";
import { FilmStripRollScene }   from "./scenes/FilmStripRollScene";
import { HydraulicPressScene }  from "./scenes/HydraulicPressScene";
import { LaserMazeBounceScene } from "./scenes/LaserMazeBounceScene";
import { OrigamiFoldScene }     from "./scenes/OrigamiFoldScene";
import { ParachuteDropScene }   from "./scenes/ParachuteDropScene";
import { PeriscopeViewScene }   from "./scenes/PeriscopeViewScene";
import { PinballBumperScene }   from "./scenes/PinballBumperScene";
import { RubiksRowTwistScene }  from "./scenes/RubiksRowTwistScene";
import { SieveFilterScene }     from "./scenes/SieveFilterScene";
import { StethoscopePulseScene } from "./scenes/StethoscopePulseScene";
import { TuningForkResonanceScene } from "./scenes/TuningForkResonanceScene";
import { WindVaneDirectionScene } from "./scenes/WindVaneDirectionScene";

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

// Fundo animado — gradiente com glow suave, tom claro ou escuro conforme o tema.
// Os dois stops do gradiente usam o MESMO hue interpolado (nunca um literal fixo) —
// é essa variação ponta-a-ponta que faz a paleta aparecer de fato na tela, já que
// 105 dos 110 tipos de cena caem neste gradiente (não têm foto de fundo).
const Background: React.FC<{ accent: string; hueFrom?: number; hueTo?: number; theme?: "dark" | "light" }> = ({ accent, hueFrom = 255, hueTo = 275, theme = "dark" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hue = interpolate(frame, [0, fps * 60], [hueFrom, hueTo], { extrapolateRight: "clamp" });
  const [innerL, outerL, sat] = theme === "light" ? [88, 97, 45] : [11, 4, 35];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 40%, hsl(${hue},${sat}%,${innerL}%) 0%, hsl(${hue},${sat}%,${outerL}%) 70%)` }}>
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
// sempre com partículas sutis e gradiente escuro na base para a legenda respirar.
// O overlay de base fica sempre escuro-tingido-pelo-hue (não inverte com o tema) —
// existe só pra dar contraste pra legenda branca, que é theme-independent.
// Tipos que já eram desenhados pra ter foto atrás (legenda/texto central, sem card
// opaco competindo). Todo o resto, quando tem backgroundImage, é "UI densa" (cards,
// contadores, ícones) e leva overlay/blur mais forte pra não perder legibilidade —
// ver isDenseUi abaixo. Espelha SCENE_TYPES_SEM_FOTO em gerar_motion.py pelo complemento.
const PHOTO_NATIVE_TYPES = new Set<Scene["type"]>(["text", "highlight", "list", "chapter", "code"]);

const SceneBackdrop: React.FC<{ scene: Scene; accent: string; index: number; hueFrom?: number; hueTo?: number; theme?: "dark" | "light" }> = ({ scene, accent, index, hueFrom, hueTo, theme = "dark" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hue = interpolate(frame, [0, fps * 60], [hueFrom ?? 255, hueTo ?? 275], { extrapolateRight: "clamp" });
  // Rack focus — só nos cards de "abertura de capítulo": o fundo sai de
  // desfocado pra nítido junto com o reveal letra-por-letra do título.
  const rackFocus = scene.type === "chapter";
  const blur = rackFocus
    ? interpolate(frame, [0, CHAPTER_REVEAL_FRAMES], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const isDenseUi = !!scene.backgroundImage && !PHOTO_NATIVE_TYPES.has(scene.type);
  const base = (a: number) => `hsla(${hue}, 30%, 4%, ${a})`;
  // Cenas nativas de foto usam texto sempre-claro com contorno (TEXT_OUTLINE) —
  // por isso o overlay delas é sempre escuro, independente do tema. UI densa usa
  // var(--ink), que inverte com o tema (claro→texto escuro, escuro→texto claro),
  // então o overlay dela sobre a foto também precisa seguir o tema — senão um
  // vídeo "claro" fica com fundo escuro forçado e texto escuro em cima, ilegível.
  const denseBase = theme === "light" ? (a: number) => `hsla(${hue}, 25%, 93%, ${a})` : base;
  return (
    <>
      {scene.backgroundImage
        ? (
          <>
            <AbsoluteFill style={{ filter: rackFocus ? `blur(${blur}px)` : isDenseUi ? "blur(3px)" : undefined }}>
              <KenBurnsImage src={scene.backgroundImage} index={index} />
            </AbsoluteFill>
            {/* Tint sutil da paleta sobre a foto — sem isso, cenas com foto nunca
                mostravam o hue, só o tom fixo das próprias fotos. Mais forte em
                cenas de UI densa (card/contador/ícone) pra foto não competir com
                a UI por atenção. mixBlendMode "color" preserva a luminosidade do
                fundo, então não precisa variar por tema. */}
            <AbsoluteFill style={{ background: `hsl(${hue}, 60%, 45%)`, mixBlendMode: "color", opacity: isDenseUi ? 0.4 : 0.2 }} />
          </>
        )
        : <Background accent={accent} hueFrom={hueFrom} hueTo={hueTo} theme={theme} />}
      <Particles accent={accent} />
      <AbsoluteFill style={{
        background: scene.backgroundImage
          ? (isDenseUi
              ? `linear-gradient(180deg, ${denseBase(0.72)} 0%, ${denseBase(0.55)} 55%, ${base(0.9)} 100%)`
              : `linear-gradient(180deg, ${base(0.55)} 0%, ${base(0.3)} 40%, ${base(0.85)} 100%)`)
          : `linear-gradient(180deg, ${base(0)} 0%, ${base(0)} 55%, ${base(0.8)} 100%)`,
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

const SceneRouter: React.FC<{ scene: Scene; accent: string; variant: number }> = ({ scene, accent, variant }) => {
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
    case "notification": return <NotificationScene scene={scene} accent={accent} />;
    case "calendar":  return <CalendarScene  scene={scene} accent={accent} variant={variant} />;
    case "clock":     return <ClockScene     scene={scene} accent={accent} variant={variant} />;
    case "moneystack": return <MoneyStackScene scene={scene} accent={accent} variant={variant} />;
    case "checklist": return <ChecklistScene  scene={scene} accent={accent} variant={variant} />;
    case "progress":  return <ProgressScene   scene={scene} accent={accent} variant={variant} />;
    case "timer":     return <TimerScene      scene={scene} accent={accent} variant={variant} />;
    case "rating":    return <RatingScene     scene={scene} accent={accent} variant={variant} />;
    case "scale":     return <ScaleScene      scene={scene} accent={accent} />;
    case "map":       return <MapScene        scene={scene} accent={accent} variant={variant} />;
    case "weather":   return <WeatherScene    scene={scene} accent={accent} />;
    case "achievement": return <AchievementScene scene={scene} accent={accent} variant={variant} />;
    case "battery":   return <BatteryScene    scene={scene} accent={accent} variant={variant} />;
    case "book":      return <BookScene       scene={scene} accent={accent} variant={variant} />;
    case "thermometer": return <ThermometerScene scene={scene} accent={accent} />;
    case "piggybank": return <PiggyBankScene  scene={scene} accent={accent} />;
    case "receipt":   return <ReceiptScene    scene={scene} accent={accent} />;
    case "roadmap":   return <RoadmapScene    scene={scene} accent={accent} />;
    case "quote":     return <QuoteScene      scene={scene} accent={accent} />;
    case "alert":     return <AlertScene      scene={scene} accent={accent} />;
    case "split":     return <SplitScene      scene={scene} accent={accent} />;
    case "counter":   return <CounterScene    scene={scene} accent={accent} />;
    case "sizecompare":   return <SizeComparisonScene scene={scene} accent={accent} />;
    case "xray":          return <AnatomyXRayScene    scene={scene} accent={accent} />;
    case "proportiongrid": return <ProportionGridScene scene={scene} accent={accent} />;
    case "speedrace":      return <SpeedRaceScene      scene={scene} accent={accent} />;
    case "timelineera":    return <TimelineEraScene    scene={scene} accent={accent} />;
    case "orbit":          return <SolarOrbitScene     scene={scene} accent={accent} />;
    case "dna":            return <DNAStrandScene      scene={scene} accent={accent} />;
    case "mythfact":       return <MythVsFactScene     scene={scene} accent={accent} />;
    case "redacted":       return <RedactedDocScene    scene={scene} accent={accent} />;
    case "magnify":        return <MagnifyingGlassScene scene={scene} accent={accent} />;
    case "censored":       return <CensoredRevealScene scene={scene} accent={accent} />;
    case "domino":         return <DominoEffectScene   scene={scene} accent={accent} />;
    case "treebranch":     return <TreeBranchScene     scene={scene} accent={accent} />;
    case "vsbattle":       return <VsBattleScene       scene={scene} accent={accent} />;
    case "brain":          return <BrainSynapseScene   scene={scene} accent={accent} />;
    case "ecg":            return <HeartbeatECGScene   scene={scene} accent={accent} />;
    case "illusion":       return <OpticalIllusionScene scene={scene} accent={accent} />;
    case "soundwave":      return <SoundWaveScene      scene={scene} accent={accent} />;
    case "depthdive":      return <DepthOceanScene     scene={scene} accent={accent} />;
    case "pressure":       return <PressureCrushScene  scene={scene} accent={accent} />;
    case "chainreaction":  return <ChainReactionScene  scene={scene} accent={accent} />;
    case "pendulum":       return <PendulumWaveScene   scene={scene} accent={accent} />;
    case "slotmachine":    return <SlotMachineScene    scene={scene} accent={accent} />;
    case "labmix":         return <LabFlaskMixScene    scene={scene} accent={accent} />;
    case "pyramid":        return <PyramidHierarchyScene scene={scene} accent={accent} />;
    case "supplychain":    return <SupplyChainScene    scene={scene} accent={accent} />;
    case "crowd":          return <PopulationCrowdScene scene={scene} accent={accent} />;
    case "balancebeam":    return <BalanceBeamScene    scene={scene} accent={accent} />;
    case "glitch":         return <GlitchSystemScene   scene={scene} accent={accent} />;
    case "radar":          return <RadarSonarScene     scene={scene} accent={accent} />;
    case "evolution":      return <EvolutionMorphScene scene={scene} accent={accent} />;
    case "microscope":     return <MicroscopeZoomScene scene={scene} accent={accent} />;
    case "telescope":      return <TelescopeStarScene  scene={scene} accent={accent} />;
    case "blueprint":      return <BlueprintDraftScene scene={scene} accent={accent} />;
    case "vortex":         return <VortexBlackHoleScene scene={scene} accent={accent} />;
    case "chess":          return <ChessStrategyScene  scene={scene} accent={accent} />;
    case "morse":          return <MorseSignalScene    scene={scene} accent={accent} />;
    case "hourglass":      return <HourglassSandScene  scene={scene} accent={accent} />;
    case "satellite":      return <SatelliteScanScene  scene={scene} accent={accent} />;
    case "barcode":        return <BarcodePriceScene   scene={scene} accent={accent} />;
    case "stamp":          return <StampApprovalScene  scene={scene} accent={accent} />;
    case "metronome":      return <MetronomeSwingScene scene={scene} accent={accent} />;
    case "compass":        return <CompassNeedleScene  scene={scene} accent={accent} />;
    case "liquidfill":     return <LiquidFillScene     scene={scene} accent={accent} />;
    case "radiotuner":     return <RadioTunerScene     scene={scene} accent={accent} />;
    case "spotlight":      return <SpotlightStageScene scene={scene} accent={accent} />;
    case "shredder":       return <PaperShredderScene  scene={scene} accent={accent} />;
    case "magnetic":       return <MagneticPolesScene  scene={scene} accent={accent} />;
    case "circuit":        return <CircuitBoardScene   scene={scene} accent={accent} />;
    case "shatter":        return <ShatterGlassScene   scene={scene} accent={accent} />;
    case "curtain":        return <CurtainRevealScene  scene={scene} accent={accent} />;
    case "bombfuse":       return <BombFuseScene       scene={scene} accent={accent} />;
    case "kaleidoscope":   return <KaleidoscopeMorphScene scene={scene} accent={accent} />;
    case "abacus":         return <AbacusBeadsScene    scene={scene} accent={accent} />;
    case "lever":          return <ArchimedesLeverScene scene={scene} accent={accent} />;
    case "cardhouse":      return <CardHouseCollapseScene scene={scene} accent={accent} />;
    case "centrifuge":     return <CentrifugeSpinScene scene={scene} accent={accent} />;
    case "chromatography": return <ChromatographySpreadScene scene={scene} accent={accent} />;
    case "cointoss":       return <CoinTossFlipScene   scene={scene} accent={accent} />;
    case "conveyor":       return <ConveyorBeltSortScene scene={scene} accent={accent} />;
    case "cubeunfold":     return <CubeUnfoldScene     scene={scene} accent={accent} />;
    case "cuckoo":         return <CuckooPendulumScene scene={scene} accent={accent} />;
    case "decibel":        return <DecibelMeterScene   scene={scene} accent={accent} />;
    case "safedial":       return <DialSafeCombinationScene scene={scene} accent={accent} />;
    case "droplet":        return <DropletRippleScene  scene={scene} accent={accent} />;
    case "elevator":       return <ElevatorFloorScene  scene={scene} accent={accent} />;
    case "filmstrip":      return <FilmStripRollScene  scene={scene} accent={accent} />;
    case "hydraulicpress": return <HydraulicPressScene scene={scene} accent={accent} />;
    case "lasermaze":      return <LaserMazeBounceScene scene={scene} accent={accent} />;
    case "origami":        return <OrigamiFoldScene    scene={scene} accent={accent} />;
    case "parachute":      return <ParachuteDropScene  scene={scene} accent={accent} />;
    case "periscope":      return <PeriscopeViewScene  scene={scene} accent={accent} />;
    case "pinball":        return <PinballBumperScene  scene={scene} accent={accent} />;
    case "rubiks":         return <RubiksRowTwistScene scene={scene} accent={accent} />;
    case "sieve":          return <SieveFilterScene    scene={scene} accent={accent} />;
    case "stethoscope":    return <StethoscopePulseScene scene={scene} accent={accent} />;
    case "tuningfork":     return <TuningForkResonanceScene scene={scene} accent={accent} />;
    case "windvane":       return <WindVaneDirectionScene scene={scene} accent={accent} />;
    case "outro":     return <OutroScene     scene={scene} accent={accent} />;
    default:          return <TextScene      scene={scene} accent={accent} />;
  }
};

// Chaves exatas geradas pelo codemod que converteu "#fff"/"rgba(255,255,255,X)" em
// var(--ink)/var(--ink-NN) nos 105 arquivos de cena sem foto (ver SCENE_TYPES_SEM_FOTO
// em gerar_motion.py) — qualquer var(--ink-NN) usado num arquivo de cena precisa de uma
// definição aqui com a mesma chave, senão resolve pra transparente silenciosamente.
const INK_ALPHA_KEYS = [
  "01", "1", "2", "03", "3", "04", "4", "05", "5", "6", "06", "07", "8", "08", "9",
  "12", "14", "15", "18", "22", "25", "35", "045", "55", "65", "75", "85",
];

const themeVars = (theme: "dark" | "light" = "dark"): React.CSSProperties => {
  const dark = theme !== "light";
  const vars: Record<string, string> = {
    "--ink": dark ? "#fff" : "#14141c",
    "--card-fill": dark ? "rgba(255,255,255,0.045)" : "rgba(10,10,20,0.05)",
  };
  const rgb = dark ? "255,255,255" : "20,20,28";
  for (const key of INK_ALPHA_KEYS) {
    vars[`--ink-${key}`] = `rgba(${rgb},${Number(`0.${key}`)})`;
  }
  return vars as React.CSSProperties;
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

    const crossfadeVariant: "fade" | "collage" = !isLast && i === collageIndex ? "collage" : "fade";
    const sceneVariant = pickVariant(`${scene.type}|${i}|${script.title || ""}`, 2);

    // Cena visual: só estende além de "dur" na variante collage (pra sobrepor com a
    // próxima durante a cascata) — as demais são corte seco, sem overlap.
    const extend = !isLast && crossfadeVariant === "collage";
    visualElements.push(
      <Sequence key={`v${i}`} from={from} durationInFrames={extend ? dur + TRANSITION_FRAMES : dur}>
        <SceneCrossfade nominalDur={dur} isLast={isLast} variant={crossfadeVariant}>
          <AbsoluteFill>
            <SceneBackdrop scene={scene} accent={accent} index={i} hueFrom={script.bgHueFrom} hueTo={script.bgHueTo} theme={script.theme} />
            <AmbientDrift index={i}>
              <SceneRouter scene={scene} accent={accent} variant={sceneVariant} />
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
    <AbsoluteFill style={{ ...themeVars(script.theme), fontFamily: "'Inter', 'Arial Black', sans-serif" }}>
      {visualElements}
      {captionElements}
    </AbsoluteFill>
  );
};
