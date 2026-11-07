/**
 * Timecode and bitrate math for the video calculator.
 * NTSC rates (23.976, 29.97, 59.94) run 1000/1001 slower than their nominal rate.
 * 29.97 and 59.94 use drop frame: frame numbers (not frames) are skipped so the
 * timecode stays in step with the clock.
 */

export type Rate = { id: string; label: string; nominal: number; ntsc: boolean; drop: number };

export const RATES: Rate[] = [
  { id: '23.976', label: '23.976', nominal: 24, ntsc: true, drop: 0 },
  { id: '24', label: '24', nominal: 24, ntsc: false, drop: 0 },
  { id: '25', label: '25', nominal: 25, ntsc: false, drop: 0 },
  { id: '29.97df', label: '29.97 DF', nominal: 30, ntsc: true, drop: 2 },
  { id: '30', label: '30', nominal: 30, ntsc: false, drop: 0 },
  { id: '50', label: '50', nominal: 50, ntsc: false, drop: 0 },
  { id: '59.94df', label: '59.94 DF', nominal: 60, ntsc: true, drop: 4 },
  { id: '60', label: '60', nominal: 60, ntsc: false, drop: 0 },
];

export const rateById = (id: string) => RATES.find((r) => r.id === id) ?? RATES[2];
export const fps = (r: Rate) => (r.ntsc ? (r.nominal * 1000) / 1001 : r.nominal);

const pad = (n: number) => String(n).padStart(2, '0');

export function framesToTimecode(total: number, r: Rate): string {
  const neg = total < 0;
  let f = Math.abs(Math.round(total));
  if (r.drop) {
    const per10 = r.nominal * 600 - r.drop * 9; // frames in 10 minutes
    const perMin = r.nominal * 60 - r.drop; // frames in a minute that drops numbers
    const tens = Math.floor(f / per10);
    const rest = f % per10;
    f += r.drop * 9 * tens + (rest > r.drop ? r.drop * Math.floor((rest - r.drop) / perMin) : 0);
  }
  const ff = f % r.nominal;
  const s = Math.floor(f / r.nominal);
  const sep = r.drop ? ';' : ':';
  return `${neg ? '-' : ''}${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}${sep}${pad(ff)}`;
}

/** Accepts HH:MM:SS:FF with ":" ";" or "." as separators. Returns null if it is not a valid timecode at that rate. */
export function timecodeToFrames(input: string, r: Rate): number | null {
  const m = input.trim().match(/^(\d{1,3})[:;.](\d{1,2})[:;.](\d{1,2})[:;.](\d{1,2})$/);
  if (!m) return null;
  const [hh, mm, ss, ff] = m.slice(1).map(Number);
  if (mm > 59 || ss > 59 || ff >= r.nominal) return null;
  // In drop frame, frames 0 and 1 (0-3 at 59.94) don't exist at the start of each minute, except every tenth.
  if (r.drop && ss === 0 && ff < r.drop && mm % 10 !== 0) return null;
  const minutes = hh * 60 + mm;
  return (hh * 3600 + mm * 60 + ss) * r.nominal + ff - r.drop * (minutes - Math.floor(minutes / 10));
}

export const framesToSeconds = (frames: number, r: Rate) => frames / fps(r);
export const secondsToFrames = (seconds: number, r: Rate) => Math.round(seconds * fps(r));

/** "90", "1:30" or "01:01:30" (decimals allowed in the seconds) → seconds. */
export function parseDuration(input: string): number | null {
  const t = input.trim().replace(',', '.');
  if (!t) return null;
  const parts = t.split(':');
  if (parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null;
  const s = parts.reduce((acc, p) => acc * 60 + Number(p), 0);
  return s > 0 ? s : null;
}

/** File size in bytes for a duration and bitrates (video in Mbps, audio in kbps). */
export const fileSizeBytes = (seconds: number, videoMbps: number, audioKbps: number) =>
  ((videoMbps * 1e6 + audioKbps * 1e3) * seconds) / 8;

/**
 * Video bitrate (Mbps) that fits a size limit (MB, 1 MB = 1,000,000 bytes) once the audio
 * is taken out. Leaves 3% for the container and bitrate swings. Null if it doesn't fit.
 */
export function videoBitrateFor(limitMB: number, seconds: number, audioKbps: number): number | null {
  const totalBps = (limitMB * 1e6 * 8 * 0.97) / seconds;
  const video = totalBps - audioKbps * 1e3;
  return video > 0 ? video / 1e6 : null;
}

export function formatSize(bytes: number, locale: string): string {
  const mb = bytes / 1e6;
  const n = (v: number, d: number) => v.toLocaleString(locale, { maximumFractionDigits: d });
  return mb >= 1000 ? `${n(mb / 1000, 2)} GB` : `${n(mb, mb < 10 ? 1 : 0)} MB`;
}
