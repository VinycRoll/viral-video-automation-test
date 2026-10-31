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
      type: "proof",
      duration: 4,
      proofTitle: "REGRA 50/30/20",
      proofBars: [
        { label: "NECESSIDADES", value: "50%", pct: 50 },
        { label: "DESEJOS", value: "30%", pct: 30 },
        { label: "INVESTIMENTOS", value: "20%", pct: 20 },
      ],
    },
    {
      type: "growth",
      duration: 5,
      growthTitle: "SUA CURVA MUDA AQUI",
      growthPoints: [
        { x: 0, y: 20 }, { x: 10, y: 35 }, { x: 20, y: 18 }, { x: 30, y: 32 },
        { x: 40, y: 20 }, { x: 55, y: 45 }, { x: 70, y: 65 }, { x: 100, y: 90 },
      ],
      growthTurnIndex: 4,
      growthCounters: [
        { to: 1000, prefix: "+R$", suffix: "/mês", label: "investindo em você", accent: true },
      ],
    },
    {
      type: "notification",
      duration: 5,
      lockTime: "9:41",
      lockDate: "Segunda, 10 de março",
      notifAppLetter: "IN",
      notifAppColor: "linear-gradient(180deg,#8a7cff,#4636d9)",
      notifOlderTitle: "Investe App",
      notifOlderBody: "Seu aporte de R$ 100 foi confirmado.",
      notifOlderTime: "8m",
      notifTitle: "Investe App",
      notifBody: "Seu rendimento este mês passou de R$ 1.000!",
      notifTime: "agora",
    },
    {
      type: "calendar",
      duration: 4,
      calendarMonth: "MARÇO",
      calendarDay: "15",
      calendarWeekday: "SEXTA-FEIRA",
      calendarNote: "dia do pagamento",
    },
    {
      type: "clock",
      duration: 4,
      clockType: "analog",
      clockTime: "07:30",
      clockNote: "antes de sair de casa, separe *10 minutos*",
    },
    {
      type: "moneystack",
      duration: 4,
      moneyValue: "R$ 1.247",
      moneyNote: "em 6 meses",
      moneyBills: 6,
    },
    {
      type: "checklist",
      duration: 5,
      checklistTitle: "ANTES DE INVESTIR",
      checklistItems: [
        "Monte sua reserva de emergência",
        "Quite dívidas com juros altos",
        "Defina seu objetivo",
      ],
    },
    {
      type: "progress",
      duration: 4,
      progressLabel: "QUEM COMEÇA CEDO",
      progressPct: 73,
      progressNote: "chega à aposentadoria tranquilo",
    },
    {
      type: "timer",
      duration: 4,
      timerLabel: "ANTES DE DORMIR",
      timerFrom: "2:00",
      timerTo: "0:00",
      timerNote: "revise seus gastos do dia",
    },
    {
      type: "rating",
      duration: 4,
      ratingLabel: "APROVAÇÃO DO MÉTODO",
      ratingValue: 4.8,
      ratingNote: "mais de 10 mil avaliações",
    },
    {
      type: "scale",
      duration: 4,
      scaleLabel: "ALUGAR OU FINANCIAR?",
      scaleLeftLabel: "ALUGAR",
      scaleLeftValue: "R$ 1.200/mês",
      scaleRightLabel: "FINANCIAR",
      scaleRightValue: "R$ 2.100/mês",
      scaleWinner: "left",
      scaleNote: "sobra mais pra investir",
    },
    {
      type: "map",
      duration: 4,
      mapLabel: "FUNCIONA EM QUALQUER LUGAR",
      mapPinLabel: "VOCÊ ESTÁ AQUI",
      mapNote: "não importa a cidade",
    },
    {
      type: "weather",
      duration: 4,
      weatherType: "rainy",
      weatherLabel: "NEM TODO MÊS É DIA DE SOL",
      weatherNote: "por isso a reserva de emergência existe",
    },
    {
      type: "achievement",
      duration: 4,
      achievementLabel: "META BATIDA",
      achievementTitle: "PRIMEIRO MIL GUARDADO",
      achievementNote: "e esse foi só o começo",
    },
    {
      type: "battery",
      duration: 4,
      batteryLabel: "SUA RESERVA DE EMERGÊNCIA",
      batteryPct: 68,
      batteryNote: "carregando aos poucos",
    },
    {
      type: "book",
      duration: 4,
      bookLabel: "ANTES DE INVESTIR",
      bookTitle: "EDUCAÇÃO FINANCEIRA",
      bookNote: "conhecimento é a base de tudo",
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
