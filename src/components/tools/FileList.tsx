import type { ReactNode } from 'react';
import { useCopy } from '../../i18n';

const COPY = {
  es: { up: 'Subir', down: 'Bajar', remove: 'Quitar', list: 'Archivos elegidos' },
  en: { up: 'Move up', down: 'Move down', remove: 'Remove', list: 'Selected files' },
};

export type Row = { id: string; name: string; detail: ReactNode; error?: boolean; thumb?: string };

/** Ordered list of files with up, down and remove buttons. */
export default function FileList({ rows, onMove, onRemove }: { rows: Row[]; onMove: (i: number, dir: -1 | 1) => void; onRemove: (i: number) => void }) {
  const c = useCopy(COPY);
  return (
    <ol className="files" aria-label={c.list}>
      {rows.map((r, i) => (
        <li key={r.id} className={r.error ? 'error' : undefined}>
          <span className="files-n mono">{String(i + 1).padStart(2, '0')}</span>
          {r.thumb && <img className="files-thumb" src={r.thumb} alt="" width={44} height={44} />}
          <span className="files-name">
            <b>{r.name}</b>
            <small>{r.detail}</small>
          </span>
          <span className="files-actions">
            <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={`${c.up}: ${r.name}`}>↑</button>
            <button type="button" onClick={() => onMove(i, 1)} disabled={i === rows.length - 1} aria-label={`${c.down}: ${r.name}`}>↓</button>
            <button type="button" onClick={() => onRemove(i)} aria-label={`${c.remove}: ${r.name}`}>✕</button>
          </span>
        </li>
      ))}
    </ol>
  );
}
