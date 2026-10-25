import { useState } from 'react';
import AutoVideo from '../AutoVideo';
import { useLang } from '../../i18n';

const PIECES = [
  { src: 't8-fondo-h', label: { es: 'Fondo 16:9', en: 'Background 16:9' }, spec: { es: 'FONDO · 1920×1080 · LOOP 40 S', en: 'BACKGROUND · 1920×1080 · 40 S LOOP' } },
  { src: 't8-fondo-v', label: { es: 'Fondo 9:16', en: 'Background 9:16' }, spec: { es: 'FONDO · 1080×1920 · LOOP 40 S', en: 'BACKGROUND · 1080×1920 · 40 S LOOP' }, vertical: true },
  { src: 't8-apertura', label: { es: 'Apertura', en: 'Opener' }, spec: { es: 'APERTURA · 10 S', en: 'OPENER · 10 S' } },
  { src: 't8-ultimo', label: { es: 'Último momento', en: 'Breaking news' }, spec: { es: 'ÚLTIMO MOMENTO · LOOP 15 S', en: 'BREAKING NEWS · 15 S LOOP' } },
];

export default function TeleochoMedia() {
  const { lang } = useLang();
  const [i, setI] = useState(0);
  const piece = PIECES[i];

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Teleocho Informa">
        {PIECES.map((p, k) => (
          <button key={p.src} role="tab" aria-selected={k === i} onClick={() => setI(k)}>
            {p.label[lang]}
          </button>
        ))}
      </div>
      <div className={`screen${piece.vertical ? ' vert' : ''}`}>
        <AutoVideo
          key={piece.src}
          src={`/assets/${piece.src}.mp4`}
          poster={`/assets/${piece.src}.jpg`}
          label={`Teleocho Informa, ${piece.label[lang]}`}
        />
        <span className="spec">{piece.spec[lang]}</span>
      </div>
    </div>
  );
}
