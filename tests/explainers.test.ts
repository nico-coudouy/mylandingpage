import { describe, expect, it } from 'vitest';
import { EXPLAINERS, explainerFromPath } from '../src/explainers/registry';
import { ROUTES } from '../src/routes';
import { TOPIC_GUIDES } from '../api/_topicGuides';
import { MAX_CHARS, checkZocalo, csvLine, toAir } from '../src/lib/zocalo';

describe('Explicado simple', () => {
  it('cada explicación tiene página, imagen para compartir, guía para el asistente y textos en los dos idiomas', () => {
    for (const e of EXPLAINERS) {
      const route = ROUTES.find((r) => r.path === `/explicado/${e.slug}`);
      expect(route?.image).toBe(e.image);
      expect(TOPIC_GUIDES[e.slug]?.guide.length).toBeGreaterThan(100);
      for (const lang of ['es', 'en'] as const) {
        expect(e.name[lang] && e.question[lang] && e.short[lang] && e.title[lang]).toBeTruthy();
        expect(e.description[lang].length).toBeLessThanOrEqual(170);
        expect(e.suggestions[lang].length).toBeGreaterThan(0);
      }
    }
  });
  it('reconoce la explicación abierta desde la URL', () => {
    expect(explainerFromPath('/explicado/hace-tu-zocalo')?.slug).toBe('hace-tu-zocalo');
    expect(explainerFromPath('/explicado/hace-tu-zocalo/')?.slug).toBe('hace-tu-zocalo');
    expect(explainerFromPath('/explicado/no-existe')).toBeUndefined();
    expect(explainerFromPath('/herramientas/qr-whatsapp')).toBeUndefined();
  });
});

describe('zócalos', () => {
  it('pasa a mayúsculas y limpia espacios como el conversor', () => {
    expect(toAir('  martín   sosa ')).toBe('MARTÍN SOSA');
    expect(toAir('jefe de guardavidas')).toBe('JEFE DE GUARDAVIDAS');
  });
  it('controla el máximo de 47 caracteres por renglón', () => {
    const ok = checkZocalo({ kind: 'volanta', top: 'Clima', main: 'Se viene un fin de semana a puro sol' });
    expect(ok.ready).toBe(true);
    expect(ok.fixedCase).toBe(true);
    const long = checkZocalo({ kind: 'volanta', top: 'Tránsito', main: 'x'.repeat(MAX_CHARS + 1) });
    expect(long.mainOk).toBe(false);
    expect(long.ready).toBe(false);
    expect(checkZocalo({ kind: 'nombre', top: 'ANA', main: '' }).ready).toBe(false);
  });
  it('arma la línea del CSV con comillas escapadas', () => {
    expect(csvLine({ kind: 'nombre', top: 'Ana "la" Pérez', main: 'Vecina' })).toBe('N51300;NOMBRE;"ANA ""LA"" PÉREZ";"VECINA"');
  });
});
