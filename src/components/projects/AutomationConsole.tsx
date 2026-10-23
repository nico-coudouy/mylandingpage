import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TOOLS = [
  {
    name: 'Escáner del archivo',
    meta: 'PYTHON · EXCEL',
    cmd: '$ python escaner_videos.py --anio 2026',
    ok: '✓ archivo indexado · Excel con una hoja por año',
    desc: 'Escanea las carpetas del archivo de video y arma un Excel con nombre, ruta, fecha y tamaño, para encontrar cualquier clip archivado. Tiene interfaz gráfica y se distribuye como .exe.',
  },
  {
    name: 'Rundowns a la gráfica',
    meta: 'AIRTABLE · SQUID CGX',
    cmd: '$ rundown airtable → squid cgx',
    ok: '✓ rundown del día cargado en la gráfica',
    desc: 'Toma el rundown del programa desde Airtable por API y lo convierte al formato del importador de Squid CGX, para que los zócalos estén listos antes de salir al aire.',
  },
];

export default function AutomationConsole() {
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
      <div className="tools" role="tablist" aria-label="Herramientas">
        {TOOLS.map((t, k) => (
          <button key={t.name} role="tab" aria-selected={k === i} onClick={() => select(k)}>
            <b>{t.name}</b>
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
            <div className="ok">{tool.ok}</div>
            <p>{tool.desc}</p>
          </>
        )}
      </div>
    </div>
  );
}
