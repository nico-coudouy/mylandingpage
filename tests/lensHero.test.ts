import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { charHistogram, hotMask, portraitCode } from '../src/lib/lensHero';

const zocalo = readFileSync(new URL('../src/lib/zocalo.ts', import.meta.url), 'utf8');

describe('portraitCode', () => {
  const code = portraitCode(zocalo);
  it('uses the real zócalo rules from the site', () => {
    expect(code.startsWith('// src/lib/zocalo.ts ')).toBe(true);
    expect(code).toContain('export const MAX_CHARS = 47;');
    expect(code).toContain('export function csvLine');
  });
  it('drops doc comments, the image code and line breaks', () => {
    expect(code).not.toContain('/**');
    expect(code).not.toContain('drawZocalo');
    expect(code).not.toMatch(/\n/);
  });
  it('falls back when the file changes shape', () => {
    expect(portraitCode('const x = 1;')).toBe('// src/lib/zocalo.ts  ');
  });
});

describe('hotMask', () => {
  it('marks keywords, 47 and strings', () => {
    const code = "export const MAX = 47; const s = 'es-AR'; let y";
    const hot = hotMask(code);
    const marked = [...code].filter((_, i) => hot[i]).join('');
    expect(marked).toBe("exportconst47const'es-AR'");
  });
});

describe('charHistogram', () => {
  it('returns normalized bins and ignores spaces', () => {
    const h = charHistogram('aab  b c', 4);
    expect(h).toHaveLength(4);
    expect(Math.max(...h)).toBe(1);
    expect(Math.min(...h)).toBeGreaterThanOrEqual(0);
  });
  it('is empty for blank input', () => {
    expect([...charHistogram('   ', 3)]).toEqual([0, 0, 0]);
  });
});
