import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useLang } from '../../i18n';

type Video = { src: string; poster: string; label: { es: string; en: string } };

const TOOLS: {
  name: { es: string; en: string };
  meta: string;
  cmd: string;
  ok: { es: string; en: string };
  desc: { es: string; en: string };
  video?: Video;
}[] = [
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
    meta: 'AIRTABLE · CSV · SQUID CGX',
    cmd: '$ rundown.csv → conversor → squid.xlsx',
    ok: { es: '✓ 39 zócalos listos en 5 minutos', en: '✓ 39 lower thirds ready in 5 minutes' },
    desc: {
      es: 'La producción escribe el rundown del programa en Airtable y descarga el CSV. El conversor lo revisa (mayúsculas, máximo 47 caracteres, volanta y texto) y arma el Excel que Squid CGX importa con Import CG playlist. Cargar los zócalos de un programa pasó de media hora a unos 5 minutos.',
      en: "Producers write the show's rundown in Airtable and download it as CSV. The converter checks it (capitals, 47-character limit, header and text) and builds the Excel file Squid CGX imports with Import CG playlist. Loading a show's lower thirds went from half an hour to about 5 minutes.",
    },
    video: {
      src: '/assets/zocalos-airtable.mp4',
      poster: '/assets/zocalos-airtable.jpg',
      label: { es: 'Tutorial de 1:26 para la producción: de Airtable a Squid en 5 pasos', en: '1:26 tutorial for producers: from Airtable to Squid in 5 steps' },
    },
  },
];

/** Tutorial video: poster with a play button; the player (and its 2 MB) only loads when pressed. */
function Tutorial({ video, lang }: { video: Video; lang: 'es' | 'en' }) {
  const [started, setStarted] = useState(false);
  const play = lang === 'es' ? 'Ver el tutorial' : 'Watch the tutorial';
  if (!started) {
    return (
      <button type="button" className="tut-poster" onClick={() => setStarted(true)} aria-label={`${play}: ${video.label[lang]}`}>
        <img src={video.poster} alt="" width={1280} height={720} loading="lazy" />
        <span className="tut-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
        <span className="tut-cap" aria-hidden="true">{play} · 1:26</span>
      </button>
    );
  }
  return (
    <video className="tut-video" src={video.src} poster={video.poster} controls autoPlay playsInline aria-label={video.label[lang]} />
  );
}

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
      {tool.video && <div className="console-shot"><Tutorial key={tool.video.src} video={tool.video} lang={lang} /></div>}
    </div>
  );
}
