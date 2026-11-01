import React from "react";

// Hash determinístico (mesmo motivo do hashString em MotionReel.tsx: precisa ser estável
// entre re-renders do Remotion, nunca pode usar Math.random()).
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Variante visual determinística por instância de cena (tipo + índice + título do vídeo)
// — a mesma cena nunca fica 100% igual em vídeos diferentes, sem precisar o Gemini
// escolher nada. count=2 -> 0 ou 1.
export function pickVariant(seed: string, count: number): number {
  return hashSeed(seed) % count;
}

// Moldura opcional em volta do elemento central das cenas "ícone + nota" (relógio,
// calendário, bateria, conquista, etc.): variant 0 = visual solto no gradiente (visual
// original), variant 1 = dentro de um card de vidro com borda de destaque na cor do
// vídeo. Dá uma textura diferente pra mesma cena sem redesenhar cada arquivo.
export const VariantFrame: React.FC<{ variant: number; accent: string; children: React.ReactNode }> = ({
  variant, accent, children,
}) => {
  if (variant % 2 === 0) return <>{children}</>;
  return (
    <div style={{
      background: "rgba(255,255,255,0.045)", borderRadius: 32,
      boxShadow: `0 24px 60px rgba(0,0,0,0.35), inset 0 0 0 2px ${accent}35`,
      padding: "40px 48px",
    }}>
      {children}
    </div>
  );
};
