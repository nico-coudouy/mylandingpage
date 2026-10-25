import { useEffect, useRef, useState } from 'react';
import AutoVideo from '../AutoVideo';
import { useLang } from '../../i18n';

type PhoneProps = {
  name: string;
  chip: string;
  caption: string;
  sub: string;
  label: string;
  small?: boolean;
};

/** Vertical video inside a phone frame, with a story-style progress bar. */
function Phone({ name, chip, caption, sub, label, small }: PhoneProps) {
  const [progress, setProgress] = useState(0);
  return (
    <figure className={small ? 'phone small' : 'phone'}>
      <div className="phone-screen">
        <AutoVideo src={`/assets/${name}.mp4`} poster={`/assets/${name}.jpg`} label={label} onProgress={setProgress} />
        <i className="phone-notch" aria-hidden="true" />
        <span className="phone-chip">{chip}</span>
        <figcaption className="phone-cap">{caption}<small>{sub}</small></figcaption>
        <span className="phone-prog" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></span>
      </div>
    </figure>
  );
}

export default function AudiovisualMedia() {
  const { lang } = useLang();
  const es = lang === 'es';
  return (
    <div className="phones">
      <Phone
        name="festival"
        chip="REEL · INSTAGRAM"
        caption={es ? 'Presentación oficial de la programación' : 'Official program launch'}
        sub={es ? '41° FESTIVAL DE CINE · MAR DEL PLATA' : '41ST FILM FESTIVAL · MAR DEL PLATA'}
        label="Mar del Plata International Film Festival"
      />
      <Phone
        small
        name="camet-norte"
        chip="VIDEO · DRONE"
        caption={es ? 'Chalet de 3 ambientes en Camet Norte' : 'Three-room house in Camet Norte'}
        sub="FLORENCIA FERRARO PROPIEDADES"
        label={es ? 'Chalet en Camet Norte' : 'House in Camet Norte'}
      />
    </div>
  );
}

/** Festival editions as a timeline; the track fills in when it scrolls into view. */
export function FestivalEditions() {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const eds = lang === 'es'
    ? [['2024', '39° FESTIVAL'], ['2025', '40° FESTIVAL'], ['2026', '41° FESTIVAL']]
    : [['2024', '39TH FESTIVAL'], ['2025', '40TH FESTIVAL'], ['2026', '41ST FESTIVAL']];

  return (
    <div ref={ref} className={on ? 'eds on' : 'eds'}>
      <span className="eds-h">{lang === 'es' ? 'Ediciones del festival' : 'Festival editions'}</span>
      <ol className="eds-row">
        <span className="eds-trk" aria-hidden="true"><i /></span>
        {eds.map(([year, label], i) => (
          <li key={year} className={i === eds.length - 1 ? 'now' : undefined} style={{ transitionDelay: `${0.25 + i * 0.35}s` }}>
            <i className="dot" aria-hidden="true" />
            <b>{year}</b>
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
