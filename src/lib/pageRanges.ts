export type PageSelection =
  | { ok: true; pages: number[] }
  | { ok: false; error: 'syntax' | 'range' | 'empty'; detail?: string };

/**
 * Reads what a person types to choose pages ("1-3, 5, 8-") and returns 0-based page
 * indexes in the order they were written, without repeats.
 * Empty input means every page. "8-" means from page 8 to the end.
 */
export function parsePageRanges(input: string, total: number): PageSelection {
  const text = input.trim();
  if (!text) return { ok: true, pages: Array.from({ length: total }, (_, i) => i) };

  const seen = new Set<number>();
  const pages: number[] = [];
  const add = (n: number) => {
    if (!seen.has(n)) {
      seen.add(n);
      pages.push(n);
    }
  };

  for (const rawPart of text.split(/[,;]/)) {
    const part = rawPart.replace(/\s+/g, '');
    if (!part) continue;
    const m = part.match(/^(\d+)?(?:(-|–|a)(\d+)?)?$/i);
    if (!m || (!m[1] && !m[3])) return { ok: false, error: 'syntax', detail: rawPart.trim() };
    const isRange = Boolean(m[2]);
    const from = m[1] ? Number(m[1]) : 1;
    const to = isRange ? (m[3] ? Number(m[3]) : total) : from;
    if (from < 1 || to < 1 || from > total || to > total) return { ok: false, error: 'range', detail: rawPart.trim() };
    const step = from <= to ? 1 : -1;
    for (let p = from; p !== to + step; p += step) add(p - 1);
  }

  return pages.length ? { ok: true, pages } : { ok: false, error: 'empty' };
}
