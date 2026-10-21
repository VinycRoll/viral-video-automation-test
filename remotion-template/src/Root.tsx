import React from "react";
import { Composition } from "remotion";
import { MotionReel } from "./MotionReel";
import { VideoScript } from "./types";

const demoScript: VideoScript = {
  title: "Demo — Finanças Pessoais",
  accentColor: "#FFD700",
  scenes: [
    {
      type: "intro",
      duration: 2.5,
      channel: "VinyBruno.ia",
      title: "JUROS COMPOSTOS",
      subtitle: "O segredo dos ricos",
    },
    {
      type: "highlight",
      duration: 3,
      text: "Você sabe o que é *juros compostos*?",
      caption: "você sabe o que são juros compostos?",
      captionFrames: 90,
      words: [
        { text: "você", start: 0.0, end: 0.3 },
        { text: "sabe", start: 0.32, end: 0.6 },
        { text: "o", start: 0.62, end: 0.68 },
        { text: "que", start: 0.7, end: 0.85 },
        { text: "são", start: 0.87, end: 1.05 },
        { text: "juros", start: 1.1, end: 1.5 },
        { text: "compostos?", start: 1.55, end: 2.3 },
      ],
    },
    {
      type: "card",
      duration: 4,
      cardTitle: "R$ 100 por mês",
      cardValue: "R$ 34.949",
      cardNote: "em 10 anos com *1% a.m.*",
    },
    {
      type: "text",
      duration: 3,
      text: "O dinheiro trabalha *por você*",
    },
    {
      type: "list",
      duration: 5,
      items: [
        "💰 Invista *cedo*",
        "📈 Seja *consistente*",
        "⏳ Deixe o *tempo* agir",
      ],
    },
    {
      type: "outro",
      duration: 3,
      channel: "VinyBruno.ia",
      title: "CURTIU? SEGUE AÍ!",
      cta: "▶ Seguir",
    },
  ],
};

const totalFrames = demoScript.scenes.reduce(
  (acc, s) => acc + Math.round(s.duration * 30),
  0
);

export const Root: React.FC = () => (
  <Composition
    id="MotionReel"
    component={MotionReel}
    durationInFrames={totalFrames}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ script: demoScript }}
    calculateMetadata={({ props }) => {
      const frames = (props.script as VideoScript).scenes.reduce(
        (acc: number, s: { duration: number }) => acc + Math.round(s.duration * 30),
        0
      );
      return { durationInFrames: frames };
    }}
  />
);
