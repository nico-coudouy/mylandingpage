import { useState } from 'react';
import { useCopy, useLang } from '../i18n';
import {
  RATES, fileSizeBytes, formatSize, framesToSeconds, framesToTimecode, parseDuration, rateById,
  secondsToFrames, timecodeToFrames, videoBitrateFor,
} from '../lib/videoMath';

const COPY = {
  es: {
    tcTitle: 'Timecode', sizeTitle: 'Peso del archivo', rateTitle: 'Bitrate para un peso máximo',
    rate: 'Cadencia (fps)',
    tc: 'Timecode', frames: 'Cuadros', seconds: 'Segundos de reloj',
    tcHint: (sep: string) => `HH:MM:SS${sep}FF`,
    invalidTc: 'Ese timecode no existe en esta cadencia.',
    dfNote: 'Drop frame: se saltean números de cuadro para que el timecode coincida con el reloj.',
    math: 'Sumar o restar', plus: '+', minus: '−', result: 'Resultado', negative: 'El resultado da negativo.',
    duration: 'Duración', durationPh: '1:30 o 90', durationHint: 'Segundos, mm:ss o hh:mm:ss',
    video: 'Video (Mbps)', audio: 'Audio (kbps)',
    estimate: 'Peso estimado', estimateNote: 'Estimación: el bitrate variable y el contenedor cambian el peso real.',
    limit: 'Peso máximo (MB)', limitHint: 'Por ejemplo 25 para adjuntarlo en Gmail',
    videoRate: 'Bitrate de video', totalRate: (v: string) => `Total con audio: ${v} Mbps. Deja un 3% de margen.`,
    noFit: 'No entra: con ese audio ya se pasa del límite.',
    waiting: 'Completá los datos.',
  },
  en: {
    tcTitle: 'Timecode', sizeTitle: 'File size', rateTitle: 'Bitrate for a size limit',
    rate: 'Frame rate (fps)',
    tc: 'Timecode', frames: 'Frames', seconds: 'Real-time seconds',
    tcHint: (sep: string) => `HH:MM:SS${sep}FF`,
    invalidTc: "That timecode doesn't exist at this frame rate.",
    dfNote: 'Drop frame: frame numbers are skipped so the timecode matches the clock.',
    math: 'Add or subtract', plus: '+', minus: '−', result: 'Result', negative: 'The result is negative.',
    duration: 'Duration', durationPh: '1:30 or 90', durationHint: 'Seconds, mm:ss or hh:mm:ss',
    video: 'Video (Mbps)', audio: 'Audio (kbps)',
    estimate: 'Estimated size', estimateNote: 'An estimate: variable bitrate and the container change the real size.',
    limit: 'Size limit (MB)', limitHint: 'For example 25 to attach it in Gmail',
    videoRate: 'Video bitrate', totalRate: (v: string) => `Total with audio: ${v} Mbps. Leaves a 3% margin.`,
    noFit: "It doesn't fit: the audio alone goes over the limit.",
    waiting: 'Fill in the details.',
  },
};

const num = (s: string) => {
  const v = Number(s.replace(',', '.'));
  return Number.isFinite(v) && v >= 0 ? v : null;
};

export default function VideoCalculator() {
  return (
    <div className="tool-panel calc">
      <TimecodeCard />
      <SizeCard />
      <BitrateCard />
    </div>
  );
}

function TimecodeCard() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const locale = lang === 'es' ? 'es-AR' : 'en-US';
  const [rateId, setRateId] = useState('25');
  const rate = rateById(rateId);
  const [frames, setFrames] = useState(0);
  // What the person is typing in each box; the others follow the frame count.
  const [draft, setDraft] = useState<{ field: 'tc' | 'frames' | 'seconds'; value: string } | null>(null);
  const [a, setA] = useState('00:00:10:00');
  const [b, setB] = useState('00:00:05:00');
  const [op, setOp] = useState<1 | -1>(1);

  const shown = (field: 'tc' | 'frames' | 'seconds', value: string) => (draft?.field === field ? draft.value : value);
  const tcError = draft?.field === 'tc' && timecodeToFrames(draft.value, rate) === null;

  const onTc = (v: string) => {
    setDraft({ field: 'tc', value: v });
    const f = timecodeToFrames(v, rate);
    if (f !== null) setFrames(f);
  };
  const onFrames = (v: string) => {
    setDraft({ field: 'frames', value: v });
    if (/^\d+$/.test(v.trim())) setFrames(Number(v));
  };
  const onSeconds = (v: string) => {
    setDraft({ field: 'seconds', value: v });
    const s = num(v);
    if (s !== null) setFrames(secondsToFrames(s, rate));
  };

  const fa = timecodeToFrames(a, rate);
  const fb = timecodeToFrames(b, rate);
  const sum = fa !== null && fb !== null ? fa + op * fb : null;

  return (
    <section className="calc-card" aria-labelledby="calc-tc">
      <h2 id="calc-tc" className="mono">{c.tcTitle}</h2>
      <label className="field">
        <span>{c.rate}</span>
        <select value={rateId} onChange={(e) => { setRateId(e.target.value); setDraft(null); }}>
          {RATES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        {rate.drop > 0 && <small>{c.dfNote}</small>}
      </label>
      <div className="calc-row">
        <label className="field">
          <span>{c.tc}</span>
          <input className="mono" value={shown('tc', framesToTimecode(frames, rate))} onChange={(e) => onTc(e.target.value)} onBlur={() => setDraft(null)} aria-invalid={tcError} placeholder={c.tcHint(rate.drop ? ';' : ':')} />
          {tcError && <small className="err">{c.invalidTc}</small>}
        </label>
        <label className="field">
          <span>{c.frames}</span>
          <input className="mono" inputMode="numeric" value={shown('frames', String(frames))} onChange={(e) => onFrames(e.target.value)} onBlur={() => setDraft(null)} />
        </label>
        <label className="field">
          <span>{c.seconds}</span>
          <input className="mono" inputMode="decimal" value={shown('seconds', framesToSeconds(frames, rate).toLocaleString(locale, { maximumFractionDigits: 3, useGrouping: false }))} onChange={(e) => onSeconds(e.target.value)} onBlur={() => setDraft(null)} />
        </label>
      </div>

      <fieldset className="field calc-math">
        <legend>{c.math}</legend>
        <div className="calc-row">
          <input className="mono" value={a} onChange={(e) => setA(e.target.value)} aria-label="A" aria-invalid={fa === null} />
          <div className="chips" role="group" aria-label={c.math}>
            <button type="button" className="chip" aria-pressed={op === 1} onClick={() => setOp(1)}>{c.plus}</button>
            <button type="button" className="chip" aria-pressed={op === -1} onClick={() => setOp(-1)}>{c.minus}</button>
          </div>
          <input className="mono" value={b} onChange={(e) => setB(e.target.value)} aria-label="B" aria-invalid={fb === null} />
        </div>
        <output className="calc-out mono">
          {sum === null ? c.invalidTc : sum < 0 ? c.negative : `${c.result}: ${framesToTimecode(sum, rate)} · ${sum} ${c.frames.toLowerCase()}`}
        </output>
      </fieldset>
    </section>
  );
}

function SizeCard() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const [duration, setDuration] = useState('1:00');
  const [video, setVideo] = useState('10');
  const [audio, setAudio] = useState('192');
  const s = parseDuration(duration);
  const v = num(video);
  const au = num(audio);
  const bytes = s && v !== null && au !== null ? fileSizeBytes(s, v, au) : null;
  return (
    <section className="calc-card" aria-labelledby="calc-size">
      <h2 id="calc-size" className="mono">{c.sizeTitle}</h2>
      <DurationField value={duration} onChange={setDuration} />
      <div className="calc-row">
        <label className="field"><span>{c.video}</span><input inputMode="decimal" value={video} onChange={(e) => setVideo(e.target.value)} /></label>
        <label className="field"><span>{c.audio}</span><input inputMode="numeric" value={audio} onChange={(e) => setAudio(e.target.value)} /></label>
      </div>
      <output className="calc-big">
        <small className="mono">{c.estimate}</small>
        <b>{bytes !== null ? formatSize(bytes, lang === 'es' ? 'es-AR' : 'en-US') : '—'}</b>
      </output>
      <small className="calc-note">{bytes !== null ? c.estimateNote : c.waiting}</small>
    </section>
  );
}

function BitrateCard() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const locale = lang === 'es' ? 'es-AR' : 'en-US';
  const [duration, setDuration] = useState('1:00');
  const [limit, setLimit] = useState('25');
  const [audio, setAudio] = useState('128');
  const s = parseDuration(duration);
  const l = num(limit);
  const au = num(audio);
  const ready = s && l && au !== null;
  const v = ready ? videoBitrateFor(l, s, au) : null;
  const f = (x: number) => x.toLocaleString(locale, { maximumFractionDigits: 2 });
  return (
    <section className="calc-card" aria-labelledby="calc-rate">
      <h2 id="calc-rate" className="mono">{c.rateTitle}</h2>
      <DurationField value={duration} onChange={setDuration} />
      <div className="calc-row">
        <label className="field"><span>{c.limit}</span><input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} /></label>
        <label className="field"><span>{c.audio}</span><input inputMode="numeric" value={audio} onChange={(e) => setAudio(e.target.value)} /></label>
      </div>
      <output className="calc-big">
        <small className="mono">{c.videoRate}</small>
        <b>{v !== null ? `${f(v)} Mbps` : '—'}</b>
      </output>
      <small className="calc-note">{!ready ? c.limitHint : v === null ? c.noFit : c.totalRate(f(v + (au ?? 0) / 1000))}</small>
    </section>
  );
}

function DurationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const c = useCopy(COPY);
  const invalid = value.trim() !== '' && parseDuration(value) === null;
  return (
    <label className="field">
      <span>{c.duration}</span>
      <input className="mono" value={value} onChange={(e) => onChange(e.target.value)} placeholder={c.durationPh} aria-invalid={invalid} />
      <small className={invalid ? 'err' : undefined}>{c.durationHint}</small>
    </label>
  );
}
