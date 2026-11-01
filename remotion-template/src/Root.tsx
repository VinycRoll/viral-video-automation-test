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
      type: "thermometer",
      duration: 4,
      thermoLabel: "RISCO DESSE INVESTIMENTO",
      thermoPct: 35,
      thermoNote: "moderado, mas vale a pena entender antes",
    },
    {
      type: "piggybank",
      duration: 4,
      piggyLabel: "GUARDANDO POUCO A POUCO",
      piggyValue: "R$ 500",
      piggyCoins: 6,
      piggyNote: "em 3 meses",
    },
    {
      type: "receipt",
      duration: 5,
      receiptTitle: "SEU SALÁRIO DE R$ 3.000",
      receiptItems: [
        { label: "Aluguel", value: "R$ 1.200" },
        { label: "Alimentação", value: "R$ 800" },
        { label: "Transporte", value: "R$ 400" },
        { label: "Investimentos", value: "R$ 300" },
      ],
      receiptTotal: "R$ 2.700",
      receiptNote: "e os outros R$ 300?",
    },
    {
      type: "roadmap",
      duration: 5,
      roadmapTitle: "SUA RESERVA EM 3 PASSOS",
      roadmapSteps: [
        { label: "Corte gastos" },
        { label: "Guarde 10%" },
        { label: "Invista sobra" },
      ],
      roadmapNote: "um passo por vez",
    },
    {
      type: "quote",
      duration: 4,
      quoteText: "Não guarde o que resta depois de gastar, gaste o que resta depois de guardar",
      quoteAuthor: "Warren Buffett",
    },
    {
      type: "alert",
      duration: 4,
      alertLabel: "ATENÇÃO",
      alertTitle: "NÃO USE O CARTÃO PRA PAGAR O MÍNIMO",
      alertNote: "isso pode te custar caro",
    },
    {
      type: "split",
      duration: 4,
      splitLabel: "ALUGUEL COM E SEM RESERVA",
      splitLeftLabel: "SEM RESERVA",
      splitLeftValue: "estresse",
      splitRightLabel: "COM RESERVA",
      splitRightValue: "tranquilidade",
      splitNote: "a diferença é só planejamento",
    },
    {
      type: "counter",
      duration: 4,
      counterLabel: "QUEM COMEÇA COM POUCO",
      counterTo: 87,
      counterSuffix: "%",
      counterNote: "chega mais longe do que imagina",
    },
    {
      type: "sizecompare",
      duration: 4,
      sizeLabel: "SEU GASTO MENSAL COM CAFÉ",
      sizeLeftLabel: "1 CAFÉ",
      sizeLeftValue: "R$ 6",
      sizeRightLabel: "1 ANO DE CAFÉ",
      sizeRightValue: "R$ 2.190",
      sizeRatio: 30,
      sizeNote: "pequenas escolhas, grande impacto",
    },
    {
      type: "xray",
      duration: 4,
      xrayLabel: "POR DENTRO DO SEU CARTÃO",
      xrayOutside: "O QUE VOCÊ VÊ",
      xrayInside: "JUROS DE 15% A.M.",
      xrayNote: "sempre leia a letra pequena",
    },
    {
      type: "proportiongrid",
      duration: 4,
      gridLabel: "QUEM TEM RESERVA DE EMERGÊNCIA",
      gridTotal: 100,
      gridHighlight: 3,
      gridNote: "apenas 3 em cada 100 brasileiros",
    },
    {
      type: "speedrace",
      duration: 4,
      raceLabel: "DINHEIRO PARADO VS INVESTIDO",
      raceItems: [
        { label: "NA POUPANÇA", value: "4% a.a.", speed: 1 },
        { label: "NO TESOURO", value: "11% a.a.", speed: 3 },
      ],
      raceNote: "a diferença se acumula com o tempo",
    },
    {
      type: "timelineera",
      duration: 4,
      eraLabel: "O TESOURO DIRETO EXISTE DESDE",
      eraFrom: 1822,
      eraTo: 2002,
      eraNote: "mais de 20 anos democratizando investimentos",
    },
    {
      type: "orbit",
      duration: 4,
      orbitLabel: "TUDO GIRA EM TORNO DISSO",
      orbitCenterLabel: "RESERVA",
      orbitItems: [
        { label: "GASTOS" }, { label: "RENDA" }, { label: "METAS" },
      ],
      orbitNote: "o centro da sua vida financeira",
    },
    {
      type: "dna",
      duration: 3,
      dnaLabel: "ISSO ESTÁ NO SEU DNA FINANCEIRO",
      dnaNote: "hábitos se repetem como um código",
    },
    {
      type: "mythfact",
      duration: 4,
      mythLabel: "INVESTIR É SÓ PRA QUEM TEM MUITO DINHEIRO",
      factLabel: "VOCÊ PODE COMEÇAR COM R$ 30",
      mythNote: "o maior mito do mercado financeiro",
    },
    {
      type: "redacted",
      duration: 4,
      redactedTitle: "ARQUIVO: TAXAS DO SEU BANCO",
      redactedWord: "R$ 40/MÊS",
      redactedNote: "é isso que a manutenção te custa",
    },
    {
      type: "magnify",
      duration: 4,
      magnifyLabel: "OLHE DE PERTO SEU EXTRATO",
      magnifyTitle: "TARIFA DE MANUTENÇÃO",
      magnifyNote: "esse detalhe some todo mês",
    },
    {
      type: "censored",
      duration: 4,
      censoredLabel: "QUANTO VOCÊ PODERIA TER HOJE",
      censoredText: "R$ 48.000",
      censoredNote: "se tivesse começado há 5 anos",
    },
    {
      type: "domino",
      duration: 4,
      dominoLabel: "UMA DÍVIDA PEQUENA DERRUBA TUDO",
      dominoCount: 6,
      dominoNote: "corte o problema na raiz",
    },
    {
      type: "treebranch",
      duration: 4,
      treeLabel: "DE ONDE VEM SEU DINHEIRO",
      treeRootLabel: "SALÁRIO",
      treeBranches: [
        { label: "CONTAS" }, { label: "RESERVA" }, { label: "INVESTIMENTOS" },
      ],
      treeNote: "cada ramo precisa de atenção",
    },
    {
      type: "vsbattle",
      duration: 4,
      vsLeftLabel: "ALUGAR",
      vsLeftValue: "flexível",
      vsRightLabel: "FINANCIAR",
      vsRightValue: "patrimônio",
      vsNote: "depende do seu momento de vida",
    },
    {
      type: "chapter",
      duration: 2,
      title: "CAPÍTULO 1",
    },
    {
      type: "code",
      duration: 4,
      code: "reserva = salario * 0.1\ninvestir(reserva)",
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
