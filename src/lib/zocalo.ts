/**
 * Lower thirds ("zócalos") for the "Hacé tu propio zócalo" explainer: the same rules the
 * Canal 8 converter checks, the lines it produces, and the image people download.
 */

/** Longest line that fits on screen in the channel's lower thirds. */
export const MAX_CHARS = 47;

/** "nombre": name on top, role below. "volanta": short header on top, headline below. */
export type ZocaloKind = 'nombre' | 'volanta';
export type Zocalo = { kind: ZocaloKind; top: string; main: string };

/** How a line goes on air: single spaces and capitals, like the converter leaves it. */
export const toAir = (s: string) => s.replace(/\s+/g, ' ').trim().toLocaleUpperCase('es-AR');

export type ZocaloCheck = {
  top: number;
  main: number;
  topOk: boolean;
  mainOk: boolean;
  /** The text had lowercase letters that the converter turns into capitals. */
  fixedCase: boolean;
  /** Both lines have text and fit. */
  ready: boolean;
};

export function checkZocalo(z: Zocalo): ZocaloCheck {
  const top = toAir(z.top).length;
  const main = toAir(z.main).length;
  const topOk = top > 0 && top <= MAX_CHARS;
  const mainOk = main > 0 && main <= MAX_CHARS;
  const fixedCase = /\p{Ll}/u.test(z.top + z.main);
  return { top, main, topOk, mainOk, fixedCase, ready: topOk && mainOk };
}

const csvCell = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** The row as it leaves Airtable: one line of the CSV, fields separated by semicolons. */
export function csvLine(z: Zocalo, note = 'N51300'): string {
  return [note, z.kind === 'nombre' ? 'NOMBRE' : 'VOLANTA', csvCell(toAir(z.top)), csvCell(toAir(z.main))].join(';');
}

/* ───────────── Downloadable image ───────────── */

export const PALETTE = { bg: '#0E0E0F', accent: '#FF5B1F', cream: '#F2EEE7', ink: '#0E0E0F', tally: '#FF3B30' };
const FONT = '"Archivo Variable", "Archivo", "Arial Narrow", sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

/** Largest font size (up to `max`) at which `text` fits in `width`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, width: number): number {
  let size = max;
  for (; size > 12; size -= 2) {
    ctx.font = `condensed ${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= width) break;
  }
  return size;
}

/** A dark studio backdrop with out-of-focus lights: clearly a simulator, not a real channel. */
function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#17120F');
  g.addColorStop(1, '#0B0B0C');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Fixed "random" lights so every download looks the same.
  const lights = [
    [0.12, 0.22, 0.16, 0.22], [0.78, 0.18, 0.2, 0.18], [0.55, 0.42, 0.12, 0.12],
    [0.3, 0.5, 0.09, 0.1], [0.9, 0.55, 0.14, 0.12], [0.05, 0.62, 0.1, 0.08],
  ];
  for (const [x, y, r, a] of lights) {
    const rad = r * Math.max(w, h);
    const lg = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, rad);
    lg.addColorStop(0, `rgba(255,91,31,${a})`);
    lg.addColorStop(1, 'rgba(255,91,31,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.strokeStyle = 'rgba(242,238,231,0.05)';
  ctx.lineWidth = 1;
  const step = Math.round(Math.min(w, h) / 18);
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
}

/** Draws the full frame: backdrop, channel bug, "SIMULADOR" label, the lower third and the site's address. */
export function drawZocalo(ctx: CanvasRenderingContext2D, w: number, h: number, z: Zocalo) {
  const vertical = h > w;
  const u = Math.min(w, h) / 100; // 1% of the short side
  drawBackdrop(ctx, w, h);

  // Channel bug and simulator label.
  ctx.fillStyle = 'rgba(14,14,15,0.7)';
  ctx.fillRect(w - 14 * u, 5 * u, 9 * u, 6 * u);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `condensed 800 ${3.4 * u}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NC', w - 9.5 * u, 8.1 * u);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(6.2 * u, 8 * u, 0.9 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `500 ${2.2 * u}px ${MONO}`;
  ctx.fillText('SIMULADOR', 8.2 * u, 8.1 * u);

  // Lower third.
  const top = toAir(z.top) || (z.kind === 'nombre' ? 'TU NOMBRE' : 'VOLANTA');
  const main = toAir(z.main) || (z.kind === 'nombre' ? 'LO QUE HACÉS' : 'EL TÍTULO DE TU NOTA');
  const left = 5 * u;
  const maxW = w - 2 * left - 4 * u;
  const big = z.kind === 'nombre' ? top : main;
  const small = z.kind === 'nombre' ? main : top;
  const bigSize = fitFont(ctx, big, 850, (vertical ? 7.2 : 8.4) * u, maxW);
  const smallSize = fitFont(ctx, small, 700, (vertical ? 3.6 : 4) * u, maxW);
  const padX = 2.2 * u;
  const bigH = bigSize * 1.32;
  const smallH = smallSize * 1.6;
  const baseY = vertical ? h * 0.7 : h - 12 * u - bigH - smallH;

  ctx.textBaseline = 'middle';
  if (z.kind === 'nombre') {
    // Name on an orange bar, role on a cream bar below.
    ctx.font = `condensed 850 ${bigSize}px ${FONT}`;
    const bw = ctx.measureText(big).width + padX * 2;
    ctx.fillStyle = PALETTE.accent;
    ctx.fillRect(left, baseY, bw, bigH);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(big, left + padX, baseY + bigH / 2 + bigSize * 0.04);
    ctx.font = `condensed 700 ${smallSize}px ${FONT}`;
    const sw = ctx.measureText(small).width + padX * 2;
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(left, baseY + bigH, sw, smallH);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(small, left + padX, baseY + bigH + smallH / 2 + smallSize * 0.04);
  } else {
    // Short header tag on orange, headline on a cream bar below.
    ctx.font = `condensed 700 ${smallSize}px ${FONT}`;
    const sw = ctx.measureText(small).width + padX * 2;
    ctx.fillStyle = PALETTE.accent;
    ctx.fillRect(left, baseY, sw, smallH);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(small, left + padX, baseY + smallH / 2 + smallSize * 0.04);
    ctx.font = `condensed 850 ${bigSize}px ${FONT}`;
    const bw = ctx.measureText(big).width + padX * 2;
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(left, baseY + smallH, bw, bigH);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(big, left + padX, baseY + smallH + bigH / 2 + bigSize * 0.04);
  }

  // The site's address, small, in a corner.
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(242,238,231,0.72)';
  ctx.font = `500 ${2.1 * u}px ${MONO}`;
  ctx.fillText('nicolascoudouy.com.ar', w - 5 * u, h - (vertical ? 9 : 4.5) * u);
  ctx.textAlign = 'left';
}

/** Renders the frame to a PNG. Waits for the fonts so the text isn't drawn with a fallback. */
export async function zocaloPng(z: Zocalo, vertical: boolean): Promise<Blob> {
  const [w, h] = vertical ? [1080, 1920] : [1920, 1080];
  try {
    await Promise.all([document.fonts.load(`condensed 850 80px ${FONT}`), document.fonts.load(`500 24px ${MONO}`)]);
  } catch {
    /* draws with the fallback font */
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  drawZocalo(ctx, w, h, z);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png'));
}
