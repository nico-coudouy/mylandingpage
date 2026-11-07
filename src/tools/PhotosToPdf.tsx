import { useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useCopy } from '../i18n';
import Dropzone from '../components/tools/Dropzone';
import FileList from '../components/tools/FileList';
import Choice from '../components/tools/Choice';
import { baseName, downloadBlob, formatBytes, move, uid } from '../lib/files';
import { fit, isHeicFile, isImageFile, openImage, thumbnail, toJpeg } from '../lib/images';

const COPY = {
  es: {
    drop: 'Soltá tus fotos acá o tocá para elegirlas',
    dropMore: 'Agregar más fotos',
    hint: 'JPG, PNG, WebP o HEIC (iPhone)',
    reading: 'Preparando…',
    heic: 'Convirtiendo foto del iPhone…',
    broken: 'No se pudo abrir esta imagen',
    notImage: 'No es una imagen',
    page: 'Hoja', a4: 'A4', legal: 'Oficio', photo: 'Tamaño de la foto',
    layout: 'Fotos por hoja', one: 'Una', two: 'Dos (frente y dorso)',
    margin: 'Margen', withMargin: 'Con margen', noMargin: 'Sin margen',
    quality: 'Calidad', high: 'Alta', medium: 'Media', light: 'Liviana',
    lightHint: 'Liviana achica las fotos para formularios con límite de peso.',
    create: 'Crear PDF',
    working: 'Armando el PDF…',
    pages: (n: number) => `${n} ${n === 1 ? 'hoja' : 'hojas'}`,
    done: (name: string, size: string) => `Listo: ${name} (${size})`,
    failed: 'Algo falló al crear el PDF. Probá con calidad Media o pedile ayuda al asistente.',
  },
  en: {
    drop: 'Drop your photos here or tap to choose them',
    dropMore: 'Add more photos',
    hint: 'JPG, PNG, WebP or HEIC (iPhone)',
    reading: 'Preparing…',
    heic: 'Converting iPhone photo…',
    broken: "Couldn't open this image",
    notImage: 'Not an image',
    page: 'Page', a4: 'A4', legal: 'Legal', photo: 'Photo size',
    layout: 'Photos per page', one: 'One', two: 'Two (front and back)',
    margin: 'Margin', withMargin: 'With margin', noMargin: 'No margin',
    quality: 'Quality', high: 'High', medium: 'Medium', light: 'Light',
    lightHint: 'Light shrinks the photos for forms with a size limit.',
    create: 'Create PDF',
    working: 'Building the PDF…',
    pages: (n: number) => `${n} ${n === 1 ? 'page' : 'pages'}`,
    done: (name: string, size: string) => `Done: ${name} (${size})`,
    failed: 'Something went wrong. Try Medium quality or ask the assistant for help.',
  },
};

type Paper = 'a4' | 'legal' | 'photo';
type Quality = 'high' | 'medium' | 'light';

/** Page sizes in PDF points (1/72 inch). Oficio is the 216 × 356 mm sheet most printers call Legal. */
const PAPER = { a4: [595.28, 841.89], legal: [612, 1008] } as const;
const QUALITY: Record<Quality, { side: number; q: number }> = {
  high: { side: 2400, q: 0.9 },
  medium: { side: 1600, q: 0.8 },
  light: { side: 1100, q: 0.65 },
};
const MARGIN = 28; // ≈ 1 cm
const GAP = 20;

type Item = { id: string; file: File; source?: Blob; thumb?: string; w?: number; h?: number; state: 'reading' | 'heic' | 'ok' | 'broken' | 'notImage' };

export default function PhotosToPdf() {
  const c = useCopy(COPY);
  const [items, setItems] = useState<Item[]>([]);
  const [paper, setPaper] = useState<Paper>('a4');
  const [two, setTwo] = useState(false);
  const [margin, setMargin] = useState(true);
  const [quality, setQuality] = useState<Quality>('medium');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const thumbs = useRef(new Set<string>());

  // Free the previews when leaving the page.
  useEffect(() => () => thumbs.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const update = (id: string, patch: Partial<Item>) => setItems((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const add = async (files: File[]) => {
    setStatus('');
    const fresh: Item[] = files.map((file) => ({ id: uid(), file, state: isImageFile(file) ? (isHeicFile(file) ? 'heic' : 'reading') : 'notImage' }));
    setItems((l) => [...l, ...fresh]);
    // One at a time: decoding several big photos at once can run a phone out of memory.
    for (const it of fresh) {
      if (it.state === 'notImage') continue;
      try {
        const { bitmap, source } = await openImage(it.file);
        const thumb = await thumbnail(bitmap);
        thumbs.current.add(thumb);
        update(it.id, { source, thumb, w: bitmap.width, h: bitmap.height, state: 'ok' });
        bitmap.close();
      } catch (e) {
        console.error(e);
        update(it.id, { state: 'broken' });
      }
    }
  };

  const ready = items.filter((i) => i.state === 'ok');
  const pending = items.some((i) => i.state === 'reading' || i.state === 'heic');
  const perPage = two && paper !== 'photo' ? 2 : 1;
  const pageCount = Math.ceil(ready.length / perPage);

  const create = async () => {
    setBusy(true);
    setStatus('');
    try {
      const pdf = await PDFDocument.create();
      const { side, q } = QUALITY[quality];
      const m = margin ? MARGIN : 0;
      for (let i = 0; i < ready.length; i += perPage) {
        const group = ready.slice(i, i + perPage);
        const images = [];
        for (const it of group) {
          const bitmap = await createImageBitmap(it.source!, { imageOrientation: 'from-image' });
          const jpeg = await toJpeg(bitmap, side, q);
          images.push(await pdf.embedJpg(await jpeg.arrayBuffer()));
          bitmap.close();
        }

        let pw: number, ph: number;
        if (paper === 'photo') {
          // Long side the size of an A4 sheet, so it prints at a sensible size.
          const s = fit(images[0].width, images[0].height, 842, 842);
          pw = s.w + m * 2;
          ph = s.h + m * 2;
        } else {
          const [a, b] = PAPER[paper];
          const landscape = perPage === 1 && images[0].width > images[0].height;
          [pw, ph] = landscape ? [b, a] : [a, b];
        }
        const page = pdf.addPage([pw, ph]);
        const slotH = (ph - m * 2 - GAP * (perPage - 1)) / perPage;
        images.forEach((img, k) => {
          const s = fit(img.width, img.height, pw - m * 2, slotH);
          page.drawImage(img, {
            x: (pw - s.w) / 2,
            y: ph - m - slotH * (k + 1) - GAP * k + (slotH - s.h) / 2,
            width: s.w,
            height: s.h,
          });
        });
      }
      const bytes = await pdf.save();
      const name = `${baseName(ready[0].file.name)}${ready.length > 1 ? `-y-${ready.length - 1}-mas` : ''}.pdf`;
      downloadBlob(bytes, name, 'application/pdf');
      setStatus(c.done(name, formatBytes(bytes.byteLength)));
    } catch (e) {
      console.error(e);
      setStatus(c.failed);
    }
    setBusy(false);
  };

  const detail = (it: Item) => {
    if (it.state === 'ok') return `${it.w} × ${it.h} px · ${formatBytes(it.file.size)}`;
    return { reading: c.reading, heic: c.heic, broken: c.broken, notImage: c.notImage }[it.state];
  };

  const remove = (i: number) => setItems((l) => {
    const thumb = l[i]?.thumb;
    if (thumb) { URL.revokeObjectURL(thumb); thumbs.current.delete(thumb); }
    return l.filter((_, k) => k !== i);
  });

  return (
    <div className="tool-panel">
      <Dropzone accept="image/*,.heic,.heif" multiple title={items.length ? c.dropMore : c.drop} hint={c.hint} onFiles={add} compact={items.length > 0} />
      {items.length > 0 && (
        <FileList
          rows={items.map((it) => ({ id: it.id, name: it.file.name, detail: detail(it), error: it.state === 'broken' || it.state === 'notImage', thumb: it.thumb }))}
          onMove={(i, dir) => setItems((l) => move(l, i, dir))}
          onRemove={remove}
        />
      )}

      <div className="tool-form">
        <Choice legend={c.page} value={paper} onChange={setPaper} options={[['a4', c.a4], ['legal', c.legal], ['photo', c.photo]]} />
        {paper !== 'photo' && (
          <Choice legend={c.layout} value={two ? 'two' : 'one'} onChange={(v) => setTwo(v === 'two')} options={[['one', c.one], ['two', c.two]]} />
        )}
        <Choice legend={c.margin} value={margin ? 'yes' : 'no'} onChange={(v) => setMargin(v === 'yes')} options={[['yes', c.withMargin], ['no', c.noMargin]]} />
        <Choice legend={c.quality} value={quality} onChange={setQuality} options={[['high', c.high], ['medium', c.medium], ['light', c.light]]} hint={c.lightHint} />
      </div>

      <div className="tool-actions">
        <button type="button" className="btn primary" onClick={create} disabled={busy || pending || ready.length === 0}>
          {busy ? c.working : c.create}
        </button>
        <span className="tool-status" role="status">{status || (ready.length ? c.pages(pageCount) : '')}</span>
      </div>
    </div>
  );
}
