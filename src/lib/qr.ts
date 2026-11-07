import qrcode from 'qrcode-generator';

/** Matrix of dark (true) and light modules. */
export type QrMatrix = boolean[][];

/**
 * Builds a QR code for any text. The library writes one byte per character, so the text
 * is converted to UTF-8 first: that way accents and ñ read correctly on any phone.
 * Level M survives a small scratch or a logo-free print. Returns null if the text is too long.
 */
export function makeQr(text: string): QrMatrix | null {
  const utf8 = Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join('');
  try {
    const qr = qrcode(0, 'M');
    qr.addData(utf8, 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, col) => qr.isDark(r, col)));
  } catch {
    return null; // more data than the largest QR code can hold
  }
}

/** SVG with one path (small file, sharp at any print size). `quiet` is the white border in modules. */
export function qrSvg(m: QrMatrix, quiet = 4): string {
  const size = m.length + quiet * 2;
  let d = '';
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c + quiet} ${r + quiet}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

/** PNG of about `px` pixels per side. */
export async function qrPng(m: QrMatrix, px = 1200, quiet = 4): Promise<Blob> {
  const modules = m.length + quiet * 2;
  const cell = Math.max(1, Math.floor(px / modules));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cell * modules;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell); }));
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
  if (!blob) throw new Error('No se pudo generar el PNG');
  return blob;
}

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

/** Wifi QR format that iPhone and Android cameras understand: they offer to join the network. */
export function wifiPayload(ssid: string, password: string, security: WifiSecurity, hidden = false): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
  const parts = [`T:${security}`, `S:${esc(ssid)}`];
  if (security !== 'nopass') parts.push(`P:${esc(password)}`);
  if (hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}
