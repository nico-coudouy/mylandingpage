import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useCopy, useLang } from '../i18n';
import { ArrowUpRight } from './Icons';

type Video = {
  id: string;
  title: string;
  client: string;
  year: number;
  kind: { es: string; en: string };
  role: { es: string; en: string };
};

const FULL_COURSE = { es: 'Cámara y edición del curso completo', en: 'Camera and editing of the full course' };
const CLIP = { es: 'Cámara y edición', en: 'Camera and editing' };

/** Client videos, best first: the first one fills the big program window. */
export const VIDEOS: Video[] = [
  {
    id: 'g85r3OG2FLw', title: 'Bordado en pedrería', client: 'Valito González', year: 2022,
    kind: { es: 'Promo de curso', en: 'Course promo' },
    role: { es: 'Dirección, cámara y edición del curso completo', en: 'Directing, camera and editing of the full course' },
  },
  { id: 'KGPVACqKMdw', title: 'Clasificación y lavado de la madera', client: 'Mercado Rawson', year: 2021, kind: { es: 'Promo de curso', en: 'Course promo' }, role: FULL_COURSE },
  { id: 'Ue9IX4QmoHo', title: 'Clasificación y lavado de la madera', client: 'Mercado Rawson', year: 2022, kind: { es: 'Presentación de curso', en: 'Course introduction' }, role: FULL_COURSE },
  { id: 'EgcoZt-52Wg', title: 'Pintura abstracta', client: 'Mercado Rawson', year: 2021, kind: { es: 'Promo de curso', en: 'Course promo' }, role: FULL_COURSE },
  { id: 'FDkaktvvOgo', title: 'Castelli', client: 'Martín Ramos Peruzzo Arquitectura', year: 2021, kind: { es: 'Clip de arquitectura', en: 'Architecture clip' }, role: CLIP },
  { id: '23FPbrYBVds', title: 'Solís', client: 'Martín Ramos Peruzzo Arquitectura', year: 2021, kind: { es: 'Clip de arquitectura', en: 'Architecture clip' }, role: CLIP },
];

const COPY = {
  es: {
    eyebrow: 'Video para clientes · Multiview',
    title: 'Cursos y clips, de la grabación a la edición.',
    lead: 'Cursos completos grabados y editados de punta a punta, y clips para estudios de arquitectura. Tocá un cuadro para verlo.',
    play: 'Reproducir',
    close: 'Cerrar',
    youtube: 'Ver en YouTube',
  },
  en: {
    eyebrow: 'Client video · Multiview',
    title: 'Courses and clips, from shoot to edit.',
    lead: 'Full online courses shot and edited end to end, plus clips for architecture studios. Tap a window to watch it.',
    play: 'Play',
    close: 'Close',
    youtube: 'Watch on YouTube',
  },
};

/**
 * YouTube doesn't generate every thumbnail size for every upload. A missing size comes back as a
 * 120×90 grey placeholder (not always as an error), so step down until a real image loads.
 */
const SIZES = ['maxresdefault', 'sddefault', 'hqdefault'];
function nextThumb(img: HTMLImageElement) {
  const cur = SIZES.findIndex((s) => img.src.includes(`/${s}.jpg`));
  if (cur >= 0 && cur < SIZES.length - 1) img.src = img.src.replace(`/${SIZES[cur]}.jpg`, `/${SIZES[cur + 1]}.jpg`);
}
function thumbLoaded(e: SyntheticEvent<HTMLImageElement>) {
  if (e.currentTarget.naturalWidth <= 120) nextThumb(e.currentTarget);
}
function thumbFailed(e: SyntheticEvent<HTMLImageElement>) {
  nextThumb(e.currentTarget);
}

/**
 * Client videos laid out like a control-room multiview: one program window and smaller sources.
 * YouTube's player only loads once a window is opened, so the page stays light.
 */
export default function Multiview() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const [open, setOpen] = useState<Video | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dl = dialog.current;
    if (!dl) return;
    if (open && !dl.open) dl.showModal();
    if (!open && dl.open) dl.close();
  }, [open]);

  return (
    <section className="mv" id="videos" aria-labelledby="mv-title">
      <div className="mv-head">
        <span className="eyebrow">{c.eyebrow}</span>
        <h3 id="mv-title">{c.title}</h3>
        <p className="sum">{c.lead}</p>
      </div>

      <ul className="mv-grid">
        {VIDEOS.map((v, i) => (
          <li key={v.id} className={i === 0 ? 'pgm' : undefined}>
            <button type="button" className="mv-tile" onClick={() => setOpen(v)} aria-label={`${c.play}: ${v.kind[lang]} ${v.title}, ${v.client}, ${v.year}`}>
              <img
                src={`https://i.ytimg.com/vi/${v.id}/${i === 0 ? 'maxresdefault' : 'hqdefault'}.jpg`}
                onLoad={thumbLoaded}
                onError={thumbFailed}
                alt=""
                width={i === 0 ? 1280 : 480}
                height={i === 0 ? 720 : 360}
                loading="lazy"
                decoding="async"
              />
              <span className="mv-src" aria-hidden="true">{i === 0 ? 'PGM' : `IN ${i + 1}`}</span>
              <span className="mv-meter" aria-hidden="true"><i /><i /></span>
              <span className="mv-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
              <span className="mv-label" aria-hidden="true">
                <b>{v.title}</b>
                <span>{v.kind[lang]} · {v.client} · {v.year}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="mv-dialog"
        aria-label={open ? `${open.kind[lang]} ${open.title}` : c.title}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
      >
        {open && (
          <div className="mv-player">
            {/* Focus starts on Close so Esc works before the viewer clicks into the YouTube player. */}
            <button type="button" className="mv-close" onClick={() => setOpen(null)} aria-label={c.close} autoFocus>✕</button>
            <div className="mv-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={`${open.kind[lang]} ${open.title} · ${open.client}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="mv-info">
              <div>
                <span className="eyebrow">{open.kind[lang]} · {open.year}</span>
                <h4>{open.title}</h4>
                <p>{open.client} · {open.role[lang]}</p>
              </div>
              <a className="btn" href={`https://www.youtube.com/watch?v=${open.id}`} target="_blank" rel="noopener">{c.youtube} <ArrowUpRight /></a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
