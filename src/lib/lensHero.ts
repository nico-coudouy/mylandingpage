/**
 * Hero "del lente al código": la animación que corre dentro de <Hero />.
 *
 * 1. Al cargar, la foto se enfoca sola (rack focus), con peaking naranja y detección de rostro.
 * 2. Con el scroll, zoom al sensor: la foto se pixeliza y una sonda lee el color de cada píxel.
 * 3. Los píxeles se convierten en caracteres de código real (src/lib/zocalo.ts) hasta formar el retrato.
 * 4. Entra el texto del hero.
 *
 * React arma el markup; este módulo lo anima directo sobre el DOM y canvas (sin re-render por frame).
 * Los elementos se buscan por data-l="nombre" dentro del <section>.
 */
import { formatTimecode } from '../hooks/useTimecode';

export type LensLabels = {
  out: string;
  focusing: string;
  ok: string;
  sensor: string;
  code: string;
  faceSearch: string;
  faceLock: string;
  luma: string;
  chars: string;
};

export type LensHeroOptions = {
  reduce: boolean;
  /** Código que forma el retrato (en una sola línea). */
  code: string;
  /** Textos dinámicos del HUD en el idioma actual (se leen en cada frame). */
  labels: () => LensLabels;
};

export type LensHero = { destroy: () => void; refit: () => void; skip: () => void };

/* Proporción de la foto recortada (public/assets/nico-cut.webp). */
const PHOTO_W = 640;
const PHOTO_H = 566;
const FOCUS_MS = 1300;
const FOCUS_DELAY = 350;
const BINS = 48;
const GLYPHS = '{}[]()<>=;:/+*#01$%&_'.split('');
const DIST = ['0.3 m', '0.5 m', '0.7 m', '1 m', '1.5 m', '2 m', '3 m', '5 m', '10 m', '∞'];
const HOT_WORDS = [/\b(export|const|function|return|string)\b/g, /\b47\b/g, /'[^']*'/g];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

/**
 * Arma el código del retrato a partir del archivo real src/lib/zocalo.ts (importado con ?raw):
 * desde MAX_CHARS hasta antes de la parte de la imagen descargable, sin los comentarios /** *\/,
 * en una sola línea. Así el retrato siempre muestra el código que está en el sitio.
 */
export function portraitCode(source: string): string {
  const start = source.indexOf('export const MAX_CHARS');
  if (start < 0) return '// src/lib/zocalo.ts  ';
  const end = source.indexOf('/* ───', start);
  const body = source
    .slice(start, end > start ? end : undefined)
    .replace(/\/\*\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `// src/lib/zocalo.ts ${body}  `;
}

/** Marca qué caracteres del código van en naranja (palabras clave, el 47 y los strings). */
export function hotMask(code: string): Uint8Array {
  const hot = new Uint8Array(code.length);
  for (const re of HOT_WORDS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) for (let j = m.index; j < m.index + m[0].length; j++) hot[j] = 1;
  }
  return hot;
}

/** Histograma de caracteres del código (sin espacios), en BINS columnas normalizadas 0..1. */
export function charHistogram(code: string, bins = BINS): Float32Array {
  const freq: Record<string, number> = {};
  for (const ch of code) if (ch !== ' ') freq[ch] = (freq[ch] || 0) + 1;
  const keys = Object.keys(freq).sort();
  const out = new Float32Array(bins);
  if (!keys.length) return out;
  keys.forEach((k, i) => { out[Math.floor((i * bins) / keys.length)] += freq[k]; });
  let max = 0;
  for (const v of out) max = Math.max(max, Math.sqrt(v));
  return out.map((v) => (max ? Math.sqrt(v) / max : 0));
}

type Grid = { cols: number; rows: number; cw: number; ch: number; data: Uint8ClampedArray };

export function startLensHero(root: HTMLElement, opts: LensHeroOptions): LensHero {
  const q = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector<T>(`[data-l="${name}"]`)!;
  const stage = q('stage');
  const shot = q('shot');
  const back = q('back');
  const img = q<HTMLImageElement>('photo');
  const cv = q<HTMLCanvasElement>('cv');
  const peak = q<HTMLCanvasElement>('peak');
  const field = q<HTMLCanvasElement>('field');
  const hist = q<HTMLCanvasElement>('hist');
  const vu = q<HTMLCanvasElement>('vu');
  const glow = q('glow');
  const words = q('words');
  const face = q('face');
  const faceLbl = q('faceLbl');
  const probe = q('probe');
  const ptag = q('ptag');
  const ring = q('ring');
  const scale = q('scale');
  const knurl = q('knurl');
  const hint = q('hint');
  const skipBtn = q('skip');
  const fstate = q('fstate');
  const steps = [q('s1'), q('s2'), q('s3')];
  const tc = q('tc');
  const copy = q('copy');
  const svc = q('svc');
  const histWrap = q('histWrap');
  const histLbl = q('histLbl');
  const vuWrap = q('vuWrap');
  const cambar = q('cambar');

  const ctx = cv.getContext('2d')!;
  const fctx = field.getContext('2d')!;
  const hctx = hist.getContext('2d')!;
  const vctx = vu.getContext('2d')!;
  const sample = document.createElement('canvas');
  const sctx = sample.getContext('2d', { willReadFrequently: true })!;

  const { reduce, code } = opts;
  const hot = hotMask(code);
  const charH = charHistogram(code);
  let lumaH = new Float32Array(BINS);
  const rnd = Array.from({ length: 20000 }, Math.random);
  const cache = new Map<string, Grid>();

  let W = 0, H = 0, dpr = 1, desk = false, ready = false, visible = true, raf = 0, destroyed = false;
  let lastKey = '';
  let tLoad = performance.now();
  let fA = reduce ? 1 : 0;
  let peakA = 0;
  // DotField
  let fw = 0, fh = 0, mx = -999, my = -999, tx = -999, ty = -999;
  // Vúmetros
  const lv = [0.4, 0.4], pk = [0, 0], pkT = [0, 0];

  /* ───────── Medidas ───────── */

  function layout() {
    const vw = innerWidth, vh = stage.clientHeight;
    desk = vw >= 900;
    let w = Math.min(vw * (desk ? 0.42 : 0.92), 600);
    let h = (w * PHOTO_H) / PHOTO_W;
    const maxH = vh * (desk ? 0.66 : 0.54);
    if (h > maxH) { h = maxH; w = (h * PHOTO_W) / PHOTO_H; }
    W = Math.round(w); H = Math.round(h);
    for (const el of [shot, back]) { el.style.width = `${W}px`; el.style.height = `${H}px`; }
    glow.style.width = glow.style.height = `${Math.round(W * 1.35)}px`;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    fw = stage.clientWidth; fh = stage.clientHeight;
    field.width = fw * dpr; field.height = fh * dpr;
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const c of [hist, vu]) {
      const r = c.getBoundingClientRect();
      c.width = Math.max(1, r.width * dpr); c.height = Math.max(1, r.height * dpr);
    }
    refit();
    cache.clear(); lastKey = '';
  }

  /** "PROCESOS / SOFTWARE" detrás de la foto: tamaño para ocupar el ancho buscado. */
  function refit() {
    if (!W) return;
    const target = desk ? W * 1.5 : innerWidth * 0.9;
    words.style.fontSize = '100px';
    const wmax = Math.max(...Array.from(words.children, (d) => (d as HTMLElement).scrollWidth));
    words.style.fontSize = `${(100 * target) / Math.max(1, wmax)}px`;
    words.style.top = `${H * 0.03}px`;
    lastKey = '';
  }

  /* ───────── Datos de la foto: peaking e histograma ───────── */

  function photoPixels() {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d')!; x.drawImage(img, 0, 0);
    return { w, h, x, d: x.getImageData(0, 0, w, h).data };
  }

  function buildPhotoData() {
    const { w, h, x, d } = photoPixels();
    // Histograma de luminancia (solo píxeles de la figura).
    const L = new Float32Array(BINS);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) continue;
      L[Math.floor(((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 256) * BINS)]++;
    }
    let m = 0;
    for (const v of L) m = Math.max(m, Math.sqrt(v));
    lumaH = L.map((v) => (m ? Math.sqrt(v) / m : 0));
    // Focus peaking: bordes (Sobel) en naranja.
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) * (d[i * 4 + 3] / 255);
    const out = x.createImageData(w, h), o = out.data;
    for (let y = 1; y < h - 1; y++) for (let xx = 1; xx < w - 1; xx++) {
      const i = y * w + xx;
      const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag > 150) { const k = i * 4; o[k] = 255; o[k + 1] = 91; o[k + 2] = 31; o[k + 3] = Math.min(255, (mag - 150) * 1.4); }
    }
    peak.width = w; peak.height = h;
    peak.getContext('2d')!.putImageData(out, 0, 0);
  }

  /* ───────── Dibujo ───────── */

  function drawField(time: number) {
    mx += (tx - mx) * 0.12; my += (ty - my) * 0.12;
    fctx.clearRect(0, 0, fw, fh);
    const sp = 34, t = time / 1000;
    for (let y = sp / 2; y < fh; y += sp) for (let x = sp / 2; x < fw; x += sp) {
      const wave = Math.sin(x * 0.006 + t * 0.6) * Math.cos(y * 0.008 - t * 0.4);
      const g = tx < -900 ? 0 : Math.max(0, 1 - Math.hypot(x - mx, y - my) / 220);
      const a = (0.04 + Math.max(0, wave) * 0.06 + g * 0.55).toFixed(3);
      fctx.fillStyle = g > 0.05 ? `rgba(255,91,31,${a})` : `rgba(242,238,231,${a})`;
      const s = 1.6 + g * 1.6;
      fctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }

  function drawHist(tC: number) {
    const w = hist.width, h = hist.height, bw = w / BINS, e = ease(tC);
    hctx.clearRect(0, 0, w, h);
    for (let i = 0; i < BINS; i++) {
      const v = lerp(lumaH[i], charH[i], e);
      hctx.fillStyle = e > 0.5 && charH[i] > 0.55 ? 'rgba(255,91,31,.9)' : `rgba(242,238,231,${0.42 + 0.2 * e})`;
      const bh = Math.max(1, v * h * 0.95);
      hctx.fillRect(i * bw, h - bh, Math.max(1, bw - dpr), bh);
    }
  }

  function drawVU(time: number) {
    const t = time / 1000, w = vu.width, h = vu.height, segs = 16, gap = 2 * dpr;
    const bw = (w - gap) / 2, sh = (h - (segs - 1) * gap) / segs;
    vctx.clearRect(0, 0, w, h);
    for (let c = 0; c < 2; c++) {
      const target = reduce ? 0.45 : clamp(0.42 + 0.14 * Math.sin(t * 2.3 + c * 1.7) + 0.1 * Math.sin(t * 6.1 + c) + 0.08 * Math.sin(t * 11.7 + c * 2.3));
      lv[c] += (target - lv[c]) * 0.25;
      if (lv[c] > pk[c] || time - pkT[c] > 900) { pk[c] = lv[c]; pkT[c] = time; }
      for (let s = 0; s < segs; s++) {
        const f = (s + 1) / segs;
        const on = f <= lv[c] + 0.001 || Math.abs(f - Math.ceil(pk[c] * segs) / segs) < 0.001;
        const col = f > 0.88 ? '255,59,48' : f > 0.7 ? '255,91,31' : '242,238,231';
        vctx.fillStyle = `rgba(${col},${on ? (f > 0.7 ? 0.9 : 0.5) : 0.08})`;
        vctx.fillRect(c * (bw + gap), h - (s + 1) * sh - s * gap, bw, sh);
      }
    }
  }

  function grid(cs: number): Grid {
    const key = cs.toFixed(1);
    const hit = cache.get(key);
    if (hit) return hit;
    const cols = Math.max(4, Math.floor(W / cs)), rows = Math.max(4, Math.floor(H / cs));
    sample.width = cols; sample.height = rows;
    sctx.clearRect(0, 0, cols, rows);
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(img, 0, 0, cols, rows);
    const g = { cols, rows, cw: W / cols, ch: H / rows, data: sctx.getImageData(0, 0, cols, rows).data };
    cache.set(key, g);
    return g;
  }

  /** Píxeles del sensor (cuadrados) que se van convirtiendo en caracteres del código. */
  function drawPixels(cs: number, sqA: number, chA: number, settle: number): Grid {
    const g = grid(cs), d = g.data;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const gap = cs > 7 ? 1 : 0, fs = Math.max(6, g.ch * 1.1), weight = g.ch < 8 ? 700 : 500;
    if (chA > 0) { ctx.font = `${weight} ${fs}px "JetBrains Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
    const tick = Math.floor(performance.now() / 70);
    let k = 0;
    for (let y = 0; y < g.rows; y++) for (let x = 0; x < g.cols; x++) {
      const i = (y * g.cols + x) * 4, a = d[i + 3] / 255;
      if (a < 0.35) continue;
      const r = d[i], gg = d[i + 1], b = d[i + 2], px = x * g.cw, py = y * g.ch;
      if (sqA > 0) {
        ctx.globalAlpha = sqA * a;
        ctx.fillStyle = `rgb(${r},${gg},${b})`;
        ctx.fillRect(px, py, g.cw - gap, g.ch - gap);
      }
      if (chA > 0) {
        const l = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
        if (l < 0.05) { k++; continue; }
        const ci = k % code.length, real = rnd[(k * 7) % rnd.length] < settle, isHot = real && hot[ci] === 1;
        const ch = real ? code[ci] : GLYPHS[Math.floor(rnd[(k * 13 + tick) % rnd.length] * GLYPHS.length)];
        k++;
        if (ch === ' ') continue;
        const lvv = Math.pow(l, 0.85);
        ctx.globalAlpha = chA * (isHot ? 0.45 + 0.55 * lvv : 0.12 + 0.88 * lvv);
        ctx.fillStyle = isHot ? '#FF5B1F' : '#F2EEE7';
        ctx.fillText(ch, px + g.cw / 2, py + g.ch / 2 + 0.5);
      }
    }
    ctx.globalAlpha = 1;
    return g;
  }

  /* ───────── Frame ───────── */

  /** Dónde se pega el escenario (debajo del menú fijo). */
  const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;

  /** 0 cuando el escenario se pega arriba, 1 cuando se termina el recorrido del hero. */
  function progress() {
    if (reduce) return 1;
    const total = root.offsetHeight - stage.clientHeight;
    return clamp((stickyTop() - root.getBoundingClientRect().top) / Math.max(1, total));
  }

  function frame(force: boolean) {
    if (!ready) return;
    const p = progress();
    const now = performance.now();
    const settling = p > 0.47 && p < 0.9;
    const key = `${p.toFixed(4)}|${fA.toFixed(3)}|${peakA.toFixed(3)}`;
    if (!force && key === lastKey && !settling) return;
    lastKey = key;

    const t = opts.labels();
    const tA = ease(fA), tB = seg(p, 0.03, 0.42), tC = seg(p, 0.42, 0.78), tD = ease(seg(p, 0.76, 0.96));
    const ok = fA >= 1;
    const ringGone = (ok && now - tLoad > FOCUS_DELAY + FOCUS_MS + 500) || tB > 0;

    // Anillo de foco, lectura y pasos
    scale.style.transform = `translateX(${-37 - tA * 74 * 9}px)`;
    knurl.style.backgroundPosition = `${-tA * 480}px 0`;
    fstate.textContent = tC > 0 ? t.code : tB > 0 ? t.sensor : ok ? `${t.ok} · ∞` : fA > 0 ? `${t.focusing} · ${DIST[Math.round(tA * 9)]}` : t.out;
    fstate.classList.toggle('ok', ok && tB === 0);
    steps[0].classList.toggle('on', tB === 0);
    steps[1].classList.toggle('on', tB > 0 && tC === 0);
    steps[2].classList.toggle('on', tC > 0);
    ring.style.opacity = ringGone ? '0' : '1';
    hint.style.opacity = ok && p < 0.02 && now - tLoad > FOCUS_DELAY + FOCUS_MS + 700 ? '1' : '0';
    skipBtn.style.opacity = tD > 0.5 ? '0' : '1';
    skipBtn.style.pointerEvents = tD > 0.5 ? 'none' : 'auto';

    // Medidores: en celular aparecen cuando se va el anillo y se van con el texto final
    const meterA = desk ? 1 : (ringGone ? 1 : 0) * (1 - tD);
    histWrap.style.opacity = vuWrap.style.opacity = String(meterA);
    cambar.style.opacity = String((ringGone ? 1 : 0) * (1 - tD));
    histLbl.textContent = tC > 0.5 ? t.chars : t.luma;
    drawHist(tC);

    // Foco real + peaking
    img.style.filter = `blur(${(1 - tA) * 18}px) brightness(${0.7 + 0.3 * tA})`;
    peak.style.opacity = String(peakA * (1 - clamp(tB * 4)));

    // Detección de rostro: busca, engancha y se va con el sensor
    face.style.opacity = String(clamp(fA * 4) * (1 - clamp(tB * 5)));
    const jit = ok ? 0 : (1 - tA) * 6;
    face.style.transform = `translate(${Math.sin(now / 90) * jit}px,${Math.cos(now / 120) * jit}px) scale(${1.18 - 0.18 * tA})`;
    face.classList.toggle('lock', ok);
    faceLbl.textContent = ok ? t.faceLock : t.faceSearch;

    // Contraluz: se prende con el foco
    glow.style.opacity = String((0.25 + 0.75 * tA) * (desk ? 0.85 : 0.7) * (1 - 0.3 * tD));

    // Zoom al sensor y vuelta; al final la foto se corre para dejar lugar al texto
    const endScale = desk ? 1 : 0.92;
    const zoom = (1 + 0.4 * ease(tB) - 0.4 * ease(tC)) * (1 + (endScale - 1) * tD);
    const dx = desk ? -tD * innerWidth * 0.2 : 0;
    const dy = desk ? 0 : -tD * stage.clientHeight * 0.17;
    shot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${zoom})`;
    back.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${1 + (zoom - 1) * 0.25})`;

    // Palabras: "software" se enciende en la fase de código
    words.style.opacity = String((0.35 + 0.65 * tA) * (1 - 0.35 * tC) * (1 - 0.8 * tD));
    words.style.setProperty('--w2s', (0.17 + 0.33 * tC).toFixed(3));
    words.style.setProperty('--w2f', (0.05 * tC).toFixed(3));

    // Canvas: píxeles → código
    if (tB <= 0) {
      img.style.opacity = '1'; cv.style.opacity = '0'; probe.style.opacity = '0';
    } else {
      img.style.opacity = String(1 - clamp(tB * 3));
      cv.style.opacity = '1';
      const finalCs = desk ? 7 : 6;
      let cs: number, sqA: number, chA: number, settle: number;
      if (tC <= 0) { cs = 2 + tB * 16; sqA = 1; chA = 0; settle = 0; }
      else { cs = 18 - tC * (18 - finalCs); sqA = 1 - clamp(tC * 1.6); chA = clamp(tC * 1.8); settle = clamp((tC - 0.25) / 0.65); }
      const g = drawPixels(cs, sqA, chA, settle);
      const pa = tB > 0.15 && tC < 0.2 ? Math.min(1, (tB - 0.15) * 6) * (1 - tC * 5) : 0;
      probe.style.opacity = String(pa);
      if (pa > 0) {
        const fx = 0.55 + 0.07 * Math.sin(tB * Math.PI * 2), fy = 0.3 + 0.1 * Math.cos(tB * Math.PI * 1.4);
        const gx = Math.floor(fx * g.cols), gy = Math.floor(fy * g.rows), i = (gy * g.cols + gx) * 4;
        probe.style.left = `${(gx + 0.5) * g.cw}px`;
        probe.style.top = `${(gy + 0.5) * g.ch}px`;
        const c = `#${hex(g.data[i])}${hex(g.data[i + 1])}${hex(g.data[i + 2])}`;
        ptag.innerHTML = `<span class="sw" style="background:${c}"></span>${c}<br>R${g.data[i]} G${g.data[i + 1]} B${g.data[i + 2]}`;
      }
    }

    // Texto final y servicios
    copy.style.opacity = String(tD);
    copy.style.transform = desk ? `translateY(calc(-50% + ${(1 - tD) * 24}px))` : `translateY(${(1 - tD) * 24}px)`;
    copy.classList.toggle('on', tD > 0.5);
    svc.style.opacity = String(tD);
  }

  function tick(now: number) {
    if (destroyed) return;
    if (visible) {
      tc.textContent = formatTimecode(now);
      if (!reduce) {
        fA = clamp((now - tLoad - FOCUS_DELAY) / FOCUS_MS);
        const after = now - tLoad - FOCUS_DELAY - FOCUS_MS;
        peakA = fA < 0.75 ? 0 : after < 0 ? (fA - 0.75) / 0.25 : clamp(1 - (after - 350) / 700);
        drawField(now);
        drawVU(now);
        if (fA < 1) lastKey = '';
      }
      frame(false);
    }
    raf = requestAnimationFrame(tick);
  }

  /* ───────── Eventos ───────── */

  const onMove = (e: PointerEvent) => { const r = stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; };
  const onLeave = () => { tx = ty = -999; };
  const onResize = () => { layout(); frame(true); };
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  addEventListener('resize', onResize);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(root);

  const start = () => {
    if (destroyed) return;
    ready = true;
    layout();
    try { buildPhotoData(); } catch { /* sin peaking ni histograma si el canvas no puede leer la foto */ }
    tLoad = performance.now();
    if (reduce) { drawField(0); drawVU(0); }
    frame(true);
    raf = requestAnimationFrame(tick);
  };
  const fonts = document.fonts
    ? Promise.all([document.fonts.load('500 12px "JetBrains Mono"'), document.fonts.load('700 12px "JetBrains Mono"')]).catch(() => null)
    : Promise.resolve();
  const photo = img.complete && img.naturalWidth ? Promise.resolve() : new Promise<void>((res) => img.addEventListener('load', () => res(), { once: true }));
  Promise.all([fonts, photo]).then(start);

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener('resize', onResize);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    },
    refit,
    skip() {
      const end = scrollY + root.getBoundingClientRect().top - stickyTop() + root.offsetHeight - stage.clientHeight;
      scrollTo({ top: end, behavior: 'auto' });
    },
  };
}
