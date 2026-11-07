import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';
import { useCopy } from '../i18n';
import Dropzone from '../components/tools/Dropzone';
import FileList from '../components/tools/FileList';
import { baseName, downloadBlob, formatBytes, move, uid } from '../lib/files';
import { parsePageRanges } from '../lib/pageRanges';

const COPY = {
  es: {
    modes: 'Qué querés hacer',
    merge: 'Unir', split: 'Separar',
    dropMany: 'Soltá tus PDF acá o tocá para elegirlos',
    dropOne: 'Soltá un PDF acá o tocá para elegirlo',
    dropMore: 'Agregar más PDF',
    hint: 'Solo archivos PDF',
    pages: (n: number) => `${n} ${n === 1 ? 'página' : 'páginas'}`,
    reading: 'Leyendo…',
    locked: 'Tiene contraseña: quitásela antes de usarlo',
    broken: 'No se pudo abrir: puede estar dañado',
    notPdf: 'No es un PDF',
    total: (files: number, pages: number) => `${files} archivos · ${pages} páginas en total`,
    needTwo: 'Elegí al menos dos PDF para unir.',
    mergeBtn: 'Unir y descargar',
    working: 'Procesando…',
    range: 'Páginas',
    rangeHint: (n: number) => `Por ejemplo 1-3, 5 u 8- (de la 8 al final). Vacío: las ${n}.`,
    rangeErr: { syntax: (d: string) => `No entiendo "${d}". Usá números, guiones y comas.`, range: (d: string, n: number) => `"${d}" no existe: el PDF tiene ${n} páginas.`, empty: () => 'Elegí al menos una página.' },
    output: 'Resultado',
    one: 'Un PDF con esas páginas', each: 'Cada página en un PDF aparte (.zip)',
    splitBtn: 'Separar y descargar',
    change: 'Elegir otro PDF',
    failed: 'Algo falló al procesar el PDF. Probá de nuevo o pedile ayuda al asistente.',
    done: 'Listo, se descargó',
  },
  en: {
    modes: 'What do you want to do',
    merge: 'Merge', split: 'Split',
    dropMany: 'Drop your PDFs here or tap to choose them',
    dropOne: 'Drop a PDF here or tap to choose it',
    dropMore: 'Add more PDFs',
    hint: 'PDF files only',
    pages: (n: number) => `${n} ${n === 1 ? 'page' : 'pages'}`,
    reading: 'Reading…',
    locked: 'Password protected: remove the password first',
    broken: "Couldn't open it: it may be damaged",
    notPdf: 'Not a PDF',
    total: (files: number, pages: number) => `${files} files · ${pages} pages in total`,
    needTwo: 'Choose at least two PDFs to merge.',
    mergeBtn: 'Merge and download',
    working: 'Working…',
    range: 'Pages',
    rangeHint: (n: number) => `For example 1-3, 5 or 8- (page 8 to the end). Empty: all ${n}.`,
    rangeErr: { syntax: (d: string) => `I don't understand "${d}". Use numbers, dashes and commas.`, range: (d: string, n: number) => `"${d}" doesn't exist: the PDF has ${n} pages.`, empty: () => 'Choose at least one page.' },
    output: 'Output',
    one: 'One PDF with those pages', each: 'Every page as its own PDF (.zip)',
    splitBtn: 'Split and download',
    change: 'Choose another PDF',
    failed: 'Something went wrong. Try again or ask the assistant for help.',
    done: 'Done, downloaded',
  },
};

type Item = { id: string; file: File; bytes?: ArrayBuffer; pages?: number; error?: 'locked' | 'broken' | 'notPdf' };

const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

async function inspect(file: File): Promise<Omit<Item, 'id' | 'file'>> {
  if (!isPdf(file)) return { error: 'notPdf' };
  const bytes = await file.arrayBuffer();
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    return { bytes, pages: doc.getPageCount() };
  } catch (e) {
    return { error: /encrypt/i.test(String(e)) ? 'locked' : 'broken' };
  }
}

function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const add = (files: File[]) => {
    const fresh = files.map((file) => ({ id: uid(), file }));
    setItems((list) => [...list, ...fresh]);
    for (const it of fresh) {
      inspect(it.file).then((info) => setItems((list) => list.map((x) => (x.id === it.id ? { ...x, ...info } : x))));
    }
  };
  return { items, setItems, add };
}

export default function PdfTool() {
  const c = useCopy(COPY);
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  return (
    <div className="tool-panel">
      <div className="chips" role="group" aria-label={c.modes}>
        <button type="button" className="chip" aria-pressed={mode === 'merge'} onClick={() => setMode('merge')}>{c.merge}</button>
        <button type="button" className="chip" aria-pressed={mode === 'split'} onClick={() => setMode('split')}>{c.split}</button>
      </div>
      {mode === 'merge' ? <Merge /> : <Split />}
    </div>
  );
}

function detail(it: Item, c: (typeof COPY)['es']) {
  if (it.error) return c[it.error];
  if (it.pages === undefined) return c.reading;
  return `${c.pages(it.pages)} · ${formatBytes(it.file.size)}`;
}

function Merge() {
  const c = useCopy(COPY);
  const { items, setItems, add } = useItems();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const ready = items.filter((i) => i.bytes);
  const pending = items.some((i) => i.pages === undefined && !i.error);
  const totalPages = ready.reduce((n, i) => n + (i.pages ?? 0), 0);

  const run = async () => {
    setBusy(true);
    setStatus('');
    try {
      const out = await PDFDocument.create();
      for (const it of ready) {
        const src = await PDFDocument.load(it.bytes!, { updateMetadata: false });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const name = `${baseName(ready[0].file.name)}-unido.pdf`;
      downloadBlob(await out.save(), name, 'application/pdf');
      setStatus(`${c.done}: ${name}`);
    } catch (e) {
      console.error(e);
      setStatus(c.failed);
    }
    setBusy(false);
  };

  return (
    <>
      <Dropzone accept="application/pdf,.pdf" multiple title={items.length ? c.dropMore : c.dropMany} hint={c.hint} onFiles={add} compact={items.length > 0} />
      {items.length > 0 && (
        <FileList
          rows={items.map((it) => ({ id: it.id, name: it.file.name, detail: detail(it, c), error: Boolean(it.error) }))}
          onMove={(i, dir) => setItems((l) => move(l, i, dir))}
          onRemove={(i) => setItems((l) => l.filter((_, k) => k !== i))}
        />
      )}
      <div className="tool-actions">
        <button type="button" className="btn primary" onClick={run} disabled={busy || pending || ready.length < 2}>
          {busy ? c.working : c.mergeBtn}
        </button>
        <span className="tool-status" role="status">
          {status || (ready.length >= 2 ? c.total(ready.length, totalPages) : items.length ? c.needTwo : '')}
        </span>
      </div>
    </>
  );
}

function Split() {
  const c = useCopy(COPY);
  const { items, setItems, add } = useItems();
  const [range, setRange] = useState('');
  const [output, setOutput] = useState<'one' | 'each'>('one');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const it = items[0];
  const total = it?.pages ?? 0;
  const sel = total ? parsePageRanges(range, total) : null;
  const rangeError = sel && !sel.ok
    ? sel.error === 'range' ? c.rangeErr.range(sel.detail ?? '', total) : sel.error === 'syntax' ? c.rangeErr.syntax(sel.detail ?? '') : c.rangeErr.empty()
    : '';

  const run = async () => {
    if (!it?.bytes || !sel?.ok) return;
    setBusy(true);
    setStatus('');
    try {
      const src = await PDFDocument.load(it.bytes, { updateMetadata: false });
      const base = baseName(it.file.name);
      if (output === 'one') {
        const out = await PDFDocument.create();
        (await out.copyPages(src, sel.pages)).forEach((p) => out.addPage(p));
        const name = `${base}-paginas.pdf`;
        downloadBlob(await out.save(), name, 'application/pdf');
        setStatus(`${c.done}: ${name}`);
      } else {
        const files: Record<string, Uint8Array> = {};
        const width = String(total).length;
        for (const index of sel.pages) {
          const out = await PDFDocument.create();
          const [page] = await out.copyPages(src, [index]);
          out.addPage(page);
          files[`${base}-${String(index + 1).padStart(width, '0')}.pdf`] = await out.save();
        }
        const name = `${base}-paginas.zip`;
        // PDFs are already compressed: store them without compressing again (faster on phones).
        downloadBlob(zipSync(files, { level: 0 }), name, 'application/zip');
        setStatus(`${c.done}: ${name}`);
      }
    } catch (e) {
      console.error(e);
      setStatus(c.failed);
    }
    setBusy(false);
  };

  if (!it) return <Dropzone accept="application/pdf,.pdf" title={c.dropOne} hint={c.hint} onFiles={(f) => add(f)} />;

  return (
    <>
      <FileList
        rows={[{ id: it.id, name: it.file.name, detail: detail(it, c), error: Boolean(it.error) }]}
        onMove={() => {}}
        onRemove={() => { setItems([]); setRange(''); setStatus(''); }}
      />
      {it.bytes && (
        <div className="tool-form">
          <label className="field">
            <span>{c.range}</span>
            <input
              type="text"
              inputMode="numeric"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder={`1-${total}`}
              aria-invalid={Boolean(rangeError)}
              aria-describedby="range-hint"
            />
            <small id="range-hint" className={rangeError ? 'err' : undefined}>{rangeError || c.rangeHint(total)}</small>
          </label>
          <fieldset className="field">
            <legend>{c.output}</legend>
            <div className="chips">
              <button type="button" className="chip" aria-pressed={output === 'one'} onClick={() => setOutput('one')}>{c.one}</button>
              <button type="button" className="chip" aria-pressed={output === 'each'} onClick={() => setOutput('each')}>{c.each}</button>
            </div>
          </fieldset>
        </div>
      )}
      <div className="tool-actions">
        <button type="button" className="btn primary" onClick={run} disabled={busy || !it.bytes || !sel?.ok}>
          {busy ? c.working : c.splitBtn}
        </button>
        <span className="tool-status" role="status">{status}</span>
      </div>
    </>
  );
}
