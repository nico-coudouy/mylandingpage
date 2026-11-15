import { describe, expect, it } from 'vitest';
import { parsePageRanges } from '../src/lib/pageRanges';
import { normalizePhone, whatsappLink } from '../src/lib/whatsapp';
import { TOOLS, toolFromPath } from '../src/tools/registry';
import { ROUTES } from '../src/routes';
import { TOOL_GUIDES } from '../api/_toolGuides';

describe('parsePageRanges', () => {
  it('vacío significa todas las páginas', () => {
    expect(parsePageRanges('  ', 3)).toEqual({ ok: true, pages: [0, 1, 2] });
  });
  it('lee páginas sueltas y rangos, en el orden escrito y sin repetir', () => {
    expect(parsePageRanges('1-3, 5, 2', 6)).toEqual({ ok: true, pages: [0, 1, 2, 4] });
    expect(parsePageRanges('4,1', 6)).toEqual({ ok: true, pages: [3, 0] });
  });
  it('acepta rangos abiertos y escritos al revés', () => {
    expect(parsePageRanges('5-', 6)).toEqual({ ok: true, pages: [4, 5] });
    expect(parsePageRanges('3-1', 6)).toEqual({ ok: true, pages: [2, 1, 0] });
    expect(parsePageRanges('2 a 3', 6)).toEqual({ ok: true, pages: [1, 2] });
  });
  it('avisa cuando una página no existe o el texto no se entiende', () => {
    expect(parsePageRanges('1-9', 6)).toMatchObject({ ok: false, error: 'range', detail: '1-9' });
    expect(parsePageRanges('0', 6)).toMatchObject({ ok: false, error: 'range' });
    expect(parsePageRanges('uno', 6)).toMatchObject({ ok: false, error: 'syntax', detail: 'uno' });
    expect(parsePageRanges(',,', 6)).toMatchObject({ ok: false, error: 'empty' });
  });
});

describe('normalizePhone', () => {
  it('arma el formato de WhatsApp para celulares argentinos escritos de distintas formas', () => {
    for (const n of ['223 593-7732', '0223 15 593-7732', '223 15 5937732', '+54 9 223 593-7732', '+54 223 593 7732', '5492235937732', '11 1512345678']) {
      expect(normalizePhone(n), n).toMatch(/^549\d{10}$/);
    }
    expect(normalizePhone('0223 15 593-7732')).toBe('5492235937732');
    expect(normalizePhone('011 15 1234-5678')).toBe('5491112345678');
  });
  it('respeta números de otros países con +', () => {
    expect(normalizePhone('+34 612 34 56 78')).toBe('34612345678');
  });
  it('rechaza números incompletos', () => {
    expect(normalizePhone('593-7732')).toBeNull();
    expect(normalizePhone('')).toBeNull();
  });
});

describe('whatsappLink', () => {
  it('codifica el mensaje y lo omite si está vacío', () => {
    expect(whatsappLink('5492235937732', 'Hola, ¿tienen turno?')).toBe('https://wa.me/5492235937732?text=Hola%2C%20%C2%BFtienen%20turno%3F');
    expect(whatsappLink('5492235937732', '  ')).toBe('https://wa.me/5492235937732');
  });
});

describe('registro de herramientas', () => {
  it('cada herramienta tiene página, guía para el asistente y textos en los dos idiomas', () => {
    for (const t of TOOLS) {
      expect(ROUTES.some((r) => r.path === `/herramientas/${t.slug}`)).toBe(true);
      expect(TOOL_GUIDES[t.slug]?.guide.length).toBeGreaterThan(100);
      for (const lang of ['es', 'en'] as const) {
        expect(t.name[lang] && t.title[lang] && t.short[lang]).toBeTruthy();
        expect(t.description[lang].length).toBeLessThanOrEqual(170);
        expect(t.suggestions[lang].length).toBeGreaterThan(0);
      }
    }
  });
  it('el menú tiene Recursos; las herramientas y explicaciones no aparecen sueltas', () => {
    const menu = ROUTES.filter((r) => r.nav !== false).map((r) => r.path);
    expect(menu).toContain('/recursos');
    expect(menu).not.toContain('/herramientas');
    expect(menu.some((p) => p.startsWith('/herramientas/') || p.startsWith('/explicado/'))).toBe(false);
  });
  it('la calculadora de video ya no está', () => {
    expect(TOOLS.some((t) => t.slug === 'calculadora-video')).toBe(false);
    expect(TOOL_GUIDES['calculadora-video']).toBeUndefined();
  });
  it('reconoce la herramienta abierta desde la URL', () => {
    expect(toolFromPath('/herramientas/fotos-a-pdf')?.slug).toBe('fotos-a-pdf');
    expect(toolFromPath('/herramientas/fotos-a-pdf/')?.slug).toBe('fotos-a-pdf');
    expect(toolFromPath('/herramientas')).toBeUndefined();
    expect(toolFromPath('/herramientas/no-existe')).toBeUndefined();
  });
});

import { wifiPayload, makeQr } from '../src/lib/qr';

describe('QR', () => {
  it('arma el texto de wifi escapando caracteres especiales', () => {
    expect(wifiPayload('Casa;Nico', 'a:b"c', 'WPA')).toBe('WIFI:T:WPA;S:Casa\\;Nico;P:a\\:b\\"c;;');
    expect(wifiPayload('Bar', 'x', 'nopass', true)).toBe('WIFI:T:nopass;S:Bar;H:true;;');
  });
  it('genera la matriz, acepta acentos y rechaza textos enormes', () => {
    const m = makeQr('https://nicolascoudouy.com.ar/herramientas?q=añadir');
    expect(m).not.toBeNull();
    expect(m!.length).toBeGreaterThanOrEqual(21);
    expect(makeQr('x'.repeat(5000))).toBeNull();
  });
});
