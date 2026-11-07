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
  it('las páginas de herramientas no aparecen en el menú, la sección sí', () => {
    const menu = ROUTES.filter((r) => r.nav !== false).map((r) => r.path);
    expect(menu).toContain('/herramientas');
    expect(menu.some((p) => p.startsWith('/herramientas/'))).toBe(false);
  });
  it('reconoce la herramienta abierta desde la URL', () => {
    expect(toolFromPath('/herramientas/fotos-a-pdf')?.slug).toBe('fotos-a-pdf');
    expect(toolFromPath('/herramientas/fotos-a-pdf/')?.slug).toBe('fotos-a-pdf');
    expect(toolFromPath('/herramientas')).toBeUndefined();
    expect(toolFromPath('/herramientas/no-existe')).toBeUndefined();
  });
});

import { fileSizeBytes, framesToTimecode, parseDuration, rateById, secondsToFrames, timecodeToFrames, videoBitrateFor, framesToSeconds } from '../src/lib/videoMath';
import { wifiPayload, makeQr } from '../src/lib/qr';

describe('timecode', () => {
  const r25 = rateById('25');
  const df30 = rateById('29.97df');
  const df60 = rateById('59.94df');

  it('convierte en ida y vuelta en 25 fps', () => {
    expect(timecodeToFrames('01:00:00:00', r25)).toBe(90000);
    expect(framesToTimecode(90000 + 24, r25)).toBe('01:00:00:24');
    expect(timecodeToFrames('00:00:00:25', r25)).toBeNull();
  });

  it('respeta el drop frame de 29.97', () => {
    expect(timecodeToFrames('00:01:00;02', df30)).toBe(1800);
    expect(framesToTimecode(1800, df30)).toBe('00:01:00;02');
    expect(framesToTimecode(1799, df30)).toBe('00:00:59;29');
    expect(timecodeToFrames('00:10:00;00', df30)).toBe(17982);
    expect(timecodeToFrames('01:00:00;00', df30)).toBe(107892);
    expect(timecodeToFrames('00:01:00;00', df30)).toBeNull(); // ese número no existe
    for (const f of [0, 1, 1799, 1800, 17981, 17982, 107891, 123456]) {
      expect(timecodeToFrames(framesToTimecode(f, df30), df30)).toBe(f);
    }
  });

  it('respeta el drop frame de 59.94', () => {
    expect(timecodeToFrames('01:00:00;00', df60)).toBe(215784);
    for (const f of [0, 3599, 3600, 35964, 215783]) {
      expect(timecodeToFrames(framesToTimecode(f, df60), df60)).toBe(f);
    }
  });

  it('una hora en 23.976 dura 3603,6 segundos de reloj', () => {
    const r = rateById('23.976');
    const frames = timecodeToFrames('01:00:00:00', r)!;
    expect(frames).toBe(86400);
    expect(framesToSeconds(frames, r)).toBeCloseTo(3603.6, 5);
    expect(secondsToFrames(10, r25)).toBe(250);
  });
});

describe('peso y bitrate', () => {
  it('lee duraciones en segundos, mm:ss y hh:mm:ss', () => {
    expect(parseDuration('90')).toBe(90);
    expect(parseDuration('1:30')).toBe(90);
    expect(parseDuration('01:01:30')).toBe(3690);
    expect(parseDuration('2,5')).toBe(2.5);
    expect(parseDuration('a:10')).toBeNull();
    expect(parseDuration('0')).toBeNull();
  });
  it('calcula el peso: 60 s a 8 Mbps + 192 kbps ≈ 61,4 MB', () => {
    expect(fileSizeBytes(60, 8, 192)).toBe(61_440_000);
  });
  it('calcula el bitrate de video para un peso máximo', () => {
    const v = videoBitrateFor(25, 60, 128)!;
    expect(v).toBeCloseTo(3.105, 3);
    expect(fileSizeBytes(60, v, 128)).toBeLessThan(25e6);
    expect(videoBitrateFor(1, 3600, 320)).toBeNull();
  });
});

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
