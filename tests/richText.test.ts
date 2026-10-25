import { describe, expect, it } from 'vitest';
import { tokenize } from '../src/lib/richText';

const links = (s: string) => tokenize(s).filter((t) => t.type === 'link').map((t) => (t.type === 'link' ? [t.text, t.href] : []));

describe('tokenize', () => {
  it('links emails, domains, profiles and WhatsApp numbers', () => {
    const s = 'Escribile a **nicocoudouy@gmail.com**, por WhatsApp al **+549223593-7732**, o mirá linkedin.com/in/nicocoudouy y github.com/nico-coudouy.';
    expect(links(s)).toEqual([
      ['nicocoudouy@gmail.com', 'mailto:nicocoudouy@gmail.com'],
      ['+549223593-7732', 'https://wa.me/5492235937732'],
      ['linkedin.com/in/nicocoudouy', 'https://linkedin.com/in/nicocoudouy'],
      ['github.com/nico-coudouy', 'https://github.com/nico-coudouy'],
    ]);
  });

  it('drops the markdown asterisks and keeps the text bold', () => {
    const t = tokenize('Hola **Nico** :)');
    expect(t.map((x) => x.text).join('')).toBe('Hola Nico 🙂');
    expect(t.find((x) => x.text === 'Nico')?.bold).toBe(true);
  });

  it('keeps sentence punctuation and parentheses out of links', () => {
    expect(links('La web (florenciaferraro.com.ar).')).toEqual([['florenciaferraro.com.ar', 'https://florenciaferraro.com.ar']]);
  });

  it('does not link tech names or short numbers', () => {
    expect(links('Usa Next.js y Node.js, ahorra 4 a 6 h, ediciones 2024 y 2025.')).toEqual([]);
  });

  it('never produces a non-http link', () => {
    for (const t of tokenize('javascript:alert(1) data:text/html,hi')) {
      if (t.type === 'link') expect(t.href).toMatch(/^(https:|mailto:)/);
    }
  });
});
