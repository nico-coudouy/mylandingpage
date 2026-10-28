import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** SMPTE-style timecode (HH:MM:SS:FF at 25 fps) for a number of milliseconds. */
export function formatTimecode(ms: number): string {
  const f = Math.floor(ms / 40);
  const s = Math.floor(f / 25);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 25)}`;
}

/** Live timecode counting from page load, like a broadcast monitor. */
export function useTimecode(): string {
  const [tc, setTc] = useState(() => formatTimecode(performance.now()));
  useEffect(() => {
    const id = setInterval(() => setTc(formatTimecode(performance.now())), 40);
    return () => clearInterval(id);
  }, []);
  return tc;
}
