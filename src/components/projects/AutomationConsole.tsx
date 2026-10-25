import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useLang } from '../../i18n';

const TOOLS = [
  {
    name: { es: 'Escáner del archivo', en: 'Archive scanner' },
    meta: 'PYTHON · EXCEL',
    cmd: '$ python escaner_videos.py --anio 2026',
    ok: { es: '✓ archivo indexado · ahorra 4 a 6 h por semana', en: '✓ archive indexed · saves 4 to 6 h a week' },
    desc: {
      es: 'Antes, encontrar un clip archivado era una búsqueda manual. Ahora el archivo de video se guarda en discos y el escáner arma un Excel con nombre, ruta, fecha y tamaño de cada archivo, que dice en qué disco está cada uno. Tiene interfaz gráfica y se distribuye como .exe.',
      en: 'Finding an archived clip used to be a manual search. Now the video archive lives on hard drives, and the scanner builds an Excel file with the name, path, date and size of every clip, showing which drive holds each one. It has a GUI and ships as a Windows .exe.',
    },
  },
  {
    name: { es: 'Rundowns a la gráfica', en: 'Rundowns to graphics' },
    meta: 'AIRTABLE · SQUID CGX',
    cmd: '$ rundown airtable → squid cgx',
    ok: { es: '✓ rundown del día cargado en la gráfica', en: "✓ today's rundown loaded into the graphics system" },
    desc: {
      es: 'Toma el rundown del programa desde Airtable por API y lo convierte al formato del importador de Squid CGX, para que los zócalos estén listos antes de salir al aire.',
      en: "Pulls the show's rundown from Airtable through its API and converts it to the Squid CGX importer format, so the lower thirds are ready before going on air.",
    },
  },
];

export default function AutomationConsole() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(TOOLS[0].cmd.length);
  const tool = TOOLS[i];
  const done = typed >= tool.cmd.length;

  // Type the command out each time a tool is selected (skipped on first paint).
  const select = (k: number) => {
    setI(k);
    setTyped(reduce ? TOOLS[k].cmd.length : 0);
  };

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setTyped((n) => n + 2), 22);
    return () => clearTimeout(id);
  }, [typed, done]);

  return (
    <div className="panel console">
      <div className="tools" role="tablist" aria-label={lang === 'es' ? 'Herramientas' : 'Tools'}>
        {TOOLS.map((t, k) => (
          <button key={t.meta} role="tab" aria-selected={k === i} onClick={() => select(k)}>
            <b>{t.name[lang]}</b>
            <span>{t.meta}</span>
          </button>
        ))}
      </div>
      <div className="term" aria-live="polite">
        <div className="cmd">
          {tool.cmd.slice(0, typed)}
          {!done && <span className="cursor" />}
        </div>
        {done && (
          <>
            <div className="ok">{tool.ok[lang]}</div>
            <p>{tool.desc[lang]}</p>
          </>
        )}
      </div>
    </div>
  );
}
