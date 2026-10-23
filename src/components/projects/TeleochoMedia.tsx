import { useState } from 'react';
import AutoVideo from '../AutoVideo';

const PIECES = [
  { label: 'Fondo 16:9', src: 't8-fondo-h', spec: 'FONDO · 1920×1080 · LOOP 40 S' },
  { label: 'Fondo 9:16', src: 't8-fondo-v', spec: 'FONDO · 1080×1920 · LOOP 40 S', vertical: true },
  { label: 'Apertura', src: 't8-apertura', spec: 'APERTURA · 10 S' },
  { label: 'Último momento', src: 't8-ultimo', spec: 'ÚLTIMO MOMENTO · LOOP 15 S' },
];

export default function TeleochoMedia() {
  const [i, setI] = useState(0);
  const piece = PIECES[i];

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Piezas de Teleocho Informa">
        {PIECES.map((p, k) => (
          <button key={p.src} role="tab" aria-selected={k === i} onClick={() => setI(k)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className={`screen${piece.vertical ? ' vert' : ''}`}>
        <AutoVideo
          key={piece.src}
          src={`/assets/${piece.src}.mp4`}
          poster={`/assets/${piece.src}.jpg`}
          label={`Teleocho Informa, ${piece.label}`}
        />
        <span className="spec">{piece.spec}</span>
      </div>
    </div>
  );
}
