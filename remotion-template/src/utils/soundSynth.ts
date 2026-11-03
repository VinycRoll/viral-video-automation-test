// Sintetizador procedural de SFX — gera WAV (PCM 16-bit, 44100Hz) em memória e
// devolve uma Data URI (data:audio/wav;base64,...) pronta pra <Audio src={...} />.
// 100% código, sem depender de nenhum arquivo .mp3/.wav externo. Cada som é
// memoizado por chave (função + parâmetros), gerado uma única vez por render.
const SAMPLE_RATE = 44100;
const FADE_SEC = 0.005; // 5ms fade in/out em todo buffer — evita cliques digitais no ffmpeg

const cache = new Map<string, string>();

function applyFade(samples: Float32Array): void {
  const fadeLen = Math.min(Math.floor(samples.length / 2), Math.round(FADE_SEC * SAMPLE_RATE));
  for (let i = 0; i < fadeLen; i++) {
    const g = i / fadeLen;
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
}

function encodeWav(samples: Float32Array): string {
  applyFade(samples);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits/sample
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function memo(key: string, gen: () => Float32Array): string {
  const cached = cache.get(key);
  if (cached) return cached;
  const uri = encodeWav(gen());
  cache.set(key, uri);
  return uri;
}

/** Clique curto e seco/mecânico (ticks de relógio, digitação, contadores). */
export function sfxTick(freq = 1200, duration = 0.03): string {
  return memo(`tick:${freq}:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 90);
      out[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
    }
    return out;
  });
}

/** Bipe eletrônico ou hospitalar (sine ou square, sustentado). */
export function sfxBeep(freq = 880, duration = 0.12, type: "sine" | "square" = "sine"): string {
  return memo(`beep:${freq}:${duration}:${type}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const phase = (2 * Math.PI * freq * i) / SAMPLE_RATE;
      out[i] = (type === "square" ? Math.sign(Math.sin(phase)) : Math.sin(phase)) * 0.5;
    }
    return out;
  });
}

/** Ruído branco filtrado com sweep rápido de frequência (transições, vento, movimento). */
export function sfxWhoosh(duration = 0.25): string {
  return memo(`whoosh:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const cutoff = 400 + t * 4000;
      const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
      lp += alpha * (Math.random() * 2 - 1 - lp);
      const env = Math.sin(Math.PI * t);
      out[i] = lp * env * 1.4;
    }
    return out;
  });
}

/** Sub-bass drop 150Hz -> 30Hz com batida seca (impactos, pesos, carimbos). */
export function sfxImpact(duration = 0.35): string {
  return memo(`impact:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const freq = 150 - t * 120;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const env = Math.exp(-t * 6);
      const clickLen = SAMPLE_RATE * 0.004;
      const click = i < clickLen ? (1 - i / clickLen) * 0.5 * (Math.random() * 2 - 1) : 0;
      out[i] = Math.sin(phase) * env * 0.9 + click;
    }
    return out;
  });
}

/** Ruído branco intenso com decay exponencial e grave profundo (explosões, colapsos). */
export function sfxExplosion(duration = 0.6): string {
  return memo(`explosion:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const cutoff = 1200 * Math.exp(-t * 3) + 80;
      const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
      lp += alpha * (Math.random() * 2 - 1 - lp);
      const env = Math.exp(-t * 4.5);
      const sub = Math.sin((2 * Math.PI * 45 * i) / SAMPLE_RATE) * Math.exp(-t * 5);
      out[i] = (lp * 1.1 + sub * 0.8) * env;
    }
    return out;
  });
}

/** Arpejo curto de 3 notas ascendentes (conquistas, aprovações). */
export function sfxSuccess(): string {
  return memo("success", () => {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const noteDur = 0.09;
    const n = Math.round(notes.length * noteDur * SAMPLE_RATE);
    const out = new Float32Array(n);
    const len = Math.round(noteDur * SAMPLE_RATE);
    notes.forEach((freq, idx) => {
      const start = idx * len;
      for (let i = 0; i < len && start + i < n; i++) {
        const env = Math.sin(Math.PI * (i / len));
        out[start + i] += Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE) * env * 0.5;
      }
    });
    return out;
  });
}

/** Duplo bipe grave/descendente de alerta ou erro (perigo, mito, bloqueio). */
export function sfxAlert(): string {
  return memo("alert", () => {
    const beepDur = 0.1;
    const gap = 0.06;
    const n = Math.round((beepDur * 2 + gap) * SAMPLE_RATE);
    const out = new Float32Array(n);
    const len = Math.round(beepDur * SAMPLE_RATE);
    [500, 380].forEach((freq, idx) => {
      const start = Math.round(idx * (beepDur + gap) * SAMPLE_RATE);
      for (let i = 0; i < len && start + i < n; i++) {
        const env = Math.sin(Math.PI * (i / len));
        out[start + i] += Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE) * env * 0.55;
      }
    });
    return out;
  });
}

/** Sweep agudo descendente 800Hz -> 200Hz (scanners, raio-x, feixes ópticos). */
export function sfxLaser(duration = 0.18): string {
  return memo(`laser:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const freq = 800 - t * 600;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      out[i] = Math.sin(phase) * Math.exp(-t * 3) * 0.5;
    }
    return out;
  });
}

/** Senoide curta com pitch subindo rápido (gotas, líquidos, química). */
export function sfxBubble(duration = 0.12): string {
  return memo(`bubble:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const freq = 300 + t * 900;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      out[i] = Math.sin(phase) * Math.sin(Math.PI * t) * 0.5;
    }
    return out;
  });
}

/** Onda senoidal com vibrato e decay longo (ondas, espaço, misticismo, ressonância). */
export function sfxResonance(freq = 440, duration = 0.7): string {
  return memo(`resonance:${freq}:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const vibrato = Math.sin(2 * Math.PI * 5 * t) * 4;
      out[i] = Math.sin(2 * Math.PI * (freq + vibrato) * t) * Math.exp(-t * 2.2) * 0.5;
    }
    return out;
  });
}

/** Ruído branco/rosa modulado (glitch, rádio fora de estação, triturador de papel). */
export function sfxStatic(duration = 0.2): string {
  return memo(`static:${duration}`, () => {
    const n = Math.round(duration * SAMPLE_RATE);
    const out = new Float32Array(n);
    let pink = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      pink = (pink + (Math.random() * 2 - 1) * 0.15) / 1.15;
      const mod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 30 * t);
      out[i] = pink * mod * 0.5;
    }
    return out;
  });
}
