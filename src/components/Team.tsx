import { useEffect, useRef, useState } from 'react';
import { useCopy, useLang } from '../i18n';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Photo = { n: string; w: number; es: string; en: string };

// Thumbnails are 480 px tall; `w` is their width so the strip can reserve space before they load.
const ROWS: Photo[][] = [
  [
    { n: 'eq01', w: 360, es: 'Control de aire', en: 'Control room' },
    { n: 'eq02', w: 640, es: 'Equipo de estudio', en: 'Studio crew' },
    { n: 'eq03', w: 360, es: 'Marplatizate en vivo', en: 'Marplatizate, live' },
    { n: 'eq04', w: 640, es: 'Debate final', en: 'Final debate' },
    { n: 'eq05', w: 270, es: 'Navidad en el canal', en: 'Christmas at the station' },
    { n: 'eq06', w: 640, es: 'Temporada 2025', en: '2025 season' },
    { n: 'eq07', w: 359, es: 'Exteriores', en: 'On location' },
    { n: 'eq08', w: 854, es: 'Streaming con chroma', en: 'Green-screen stream' },
  ],
  [
    { n: 'eq09', w: 360, es: 'Control de aire en vivo', en: 'Control room, live' },
    { n: 'eq10', w: 640, es: 'Equipo del canal', en: 'Station team' },
    { n: 'eq11', w: 291, es: 'Turno en el control', en: 'Shift in the control room' },
    { n: 'eq12', w: 640, es: 'Compañeros de estudio', en: 'Studio teammates' },
    { n: 'eq13', w: 360, es: 'Estudio de verano en la playa', en: 'Summer studio on the beach' },
    { n: 'eq14', w: 640, es: 'Equipo en el set', en: 'Crew on set' },
    { n: 'eq15', w: 360, es: 'Control · Teleocho', en: 'Control room · Teleocho' },
    { n: 'eq16', w: 360, es: 'Festejo en el estudio', en: 'Celebration in the studio' },
    { n: 'eq17', w: 360, es: 'Equipo de piso', en: 'Floor crew' },
  ],
];
const ALL = ROWS.flat();

const COPY = {
  es: {
    eyebrow: 'En equipo',
    title: 'Nada sale al aire solo.',
    text: 'Nueve años en el equipo de Canal 8: control, cámaras, producción y técnica. Coordinar en vivo, resolver bajo presión y comunicar claro es lo que llevo a cada proyecto.',
    pause: 'Pausar movimiento', play: 'Reanudar movimiento',
    open: 'Ampliar foto', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente',
    alt: 'Nico con compañeros de Canal 8',
  },
  en: {
    eyebrow: 'Teamwork',
    title: 'Nothing goes on air alone.',
    text: 'Nine years on the Canal 8 team: control room, cameras, production and engineering. Coordinating live, solving problems under pressure and communicating clearly is what I bring to every project.',
    pause: 'Pause motion', play: 'Resume motion',
    open: 'Enlarge photo', close: 'Close', prev: 'Previous photo', next: 'Next photo',
    alt: 'Nico with Canal 8 teammates',
  },
};

/**
 * A strip that drifts on its own but stays a normal scroll container, so it can be
 * swiped or dragged. The photos are rendered twice and the position wraps at half
 * the width, which makes the loop seamless in both directions.
 */
function Strip({ photos, dir, speed, paused, onOpen, label }: {
  photos: Photo[]; dir: 1 | -1; speed: number; paused: boolean; onOpen: (n: string) => void; label: (p: Photo) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, last = 0, visible = false, hold = 0, pos = -1;
    const half = () => el.scrollWidth / 2;
    const touch = () => { hold = performance.now() + 2500; pos = -1; };
    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (visible && !pausedRef.current && now > hold && !el.matches(':hover')) {
        const h = half();
        if (h > 0) {
          if (pos < 0) pos = el.scrollLeft || (dir < 0 ? h : 0);
          pos += dir * speed * dt;
          if (pos >= h) pos -= h;
          if (pos <= 0) pos += h;
          el.scrollLeft = pos;
        }
      }
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    el.addEventListener('pointerdown', touch);
    el.addEventListener('wheel', touch, { passive: true });
    el.addEventListener('touchstart', touch, { passive: true });
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', touch);
      el.removeEventListener('wheel', touch);
      el.removeEventListener('touchstart', touch);
    };
  }, [dir, speed]);

  return (
    <div ref={ref} className="team-strip">
      <div className="team-track">
        {[0, 1].map((copy) => photos.map((p) => (
          <button
            key={`${copy}-${p.n}`}
            type="button"
            className="team-item"
            style={{ aspectRatio: `${p.w} / 480` }}
            onClick={() => onOpen(p.n)}
            aria-hidden={copy === 1 || undefined}
            tabIndex={copy === 1 ? -1 : undefined}
            aria-label={label(p)}
          >
            <img src={`/assets/equipo/${p.n}-t.webp`} alt="" width={p.w} height={480} loading="lazy" decoding="async" />
          </button>
        )))}
      </div>
    </div>
  );
}

export default function Team() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const show = (n: string) => setOpen(ALL.findIndex((p) => p.n === n));
  const move = (d: number) => setOpen((i) => (i === null ? null : (i + d + ALL.length) % ALL.length));

  useEffect(() => {
    const dl = dialog.current;
    if (!dl) return;
    if (open !== null && !dl.open) dl.showModal();
    if (open === null && dl.open) dl.close();
  }, [open]);

  const still = reduce || paused;
  const cur = open !== null ? ALL[open] : null;

  return (
    <section className="sec team" id="equipo" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head team-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.text}</p>
        </div>
      </div>
      <div className="team-rows">
        <Strip photos={ROWS[0]} dir={1} speed={28} paused={still} onOpen={show} label={(p) => `${c.open}: ${p[lang]}`} />
        <Strip photos={ROWS[1]} dir={-1} speed={22} paused={still} onOpen={show} label={(p) => `${c.open}: ${p[lang]}`} />
      </div>
      {!reduce && (
        <div className="wrap team-ctrl">
          <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /></svg>
            )}
            {paused ? c.play : c.pause}
          </button>
        </div>
      )}
      <dialog ref={dialog} className="team-lb" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }} aria-label={cur ? cur[lang] : c.alt}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
        {cur && (
          <figure>
            <img src={`/assets/equipo/${cur.n}.webp`} alt={`${c.alt}: ${cur[lang]}`} />
            <figcaption>{cur[lang]}<span>{(open ?? 0) + 1} / {ALL.length}</span></figcaption>
          </figure>
        )}
        <button type="button" className="team-lb-btn prev" onClick={() => move(-1)} aria-label={c.prev}>‹</button>
        <button type="button" className="team-lb-btn next" onClick={() => move(1)} aria-label={c.next}>›</button>
        <button type="button" className="team-lb-btn close" onClick={() => setOpen(null)} aria-label={c.close}>✕</button>
      </dialog>
    </section>
  );
}
