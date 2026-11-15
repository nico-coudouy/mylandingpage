import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useCopy } from '../i18n';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MAX_CHARS, checkZocalo, csvLine, toAir, zocaloPng, type Zocalo, type ZocaloKind } from '../lib/zocalo';

const STEP_MS = 1100;

const COPY = {
  es: {
    kinds: { nombre: 'Nombre y cargo', volanta: 'Volanta y título' },
    kindLabel: 'Tipo de zócalo',
    labels: { nombre: ['Nombre', 'Cargo o lo que hacés'], volanta: ['Volanta', 'Título'] },
    placeholders: { nombre: ['Tu nombre', 'Lo que hacés'], volanta: ['Clima', 'Se viene un fin de semana a puro sol'] },
    empty: { nombre: ['TU NOMBRE', 'LO QUE HACÉS'], volanta: ['VOLANTA', 'EL TÍTULO DE TU NOTA'] },
    examples: 'Probá con',
    exampleList: [
      { label: 'Un entrevistado', z: { kind: 'nombre', top: 'Martín Sosa', main: 'Jefe de guardavidas' } },
      { label: 'Una noticia', z: { kind: 'volanta', top: 'Clima', main: 'Se viene un fin de semana a puro sol' } },
      { label: 'Uno larguísimo', z: { kind: 'volanta', top: 'Tránsito', main: 'Cortes y desvíos en el centro por las obras en la avenida Colón' } },
    ] as { label: string; z: Zocalo }[],
    rules: {
      length: `Hasta ${MAX_CHARS} caracteres por renglón`,
      caps: 'Todo en mayúsculas',
      capsFixed: 'Todo en mayúsculas (lo paso yo, como el conversor)',
      both: 'Los dos renglones completos',
    },
    over: (n: number) => `Te pasaste por ${n}: en pantalla no entra.`,
    send: 'Mandar a la gráfica',
    sendHint: 'Completá los dos renglones y que entren en 47 caracteres.',
    pvw: 'VISTA PREVIA',
    pgm: 'AL AIRE',
    sim: 'SIMULADOR',
    pipeTitle: 'El recorrido',
    steps: [
      { tag: 'AIRTABLE', title: 'La planilla', text: 'La producción escribe cada zócalo en una planilla compartida (Airtable), en la fila de su nota.' },
      { tag: 'CSV', title: 'El archivo', text: 'La planilla se descarga como CSV: texto plano, una línea por zócalo, que cualquier programa entiende.' },
      { tag: 'CONVERSOR', title: 'El conversor', text: 'El programa que hice revisa las reglas (mayúsculas, máximo 47 caracteres) y arma el archivo que entiende la gráfica.' },
      { tag: 'SQUID', title: 'La gráfica', text: 'Squid, el sistema de gráfica del canal, carga el zócalo en la lista del programa. Queda listo, pero todavía no sale.' },
    ],
    idle: 'Escribí tu zócalo y mandalo a la gráfica para ver el recorrido.',
    operator: 'La máquina prepara, la persona decide: en el canal, el operador de gráfica elige el momento justo. Ahora te toca a vos.',
    take: 'Sacar al aire',
    onAir: '¡Estás al aire! Así se ve en la tele.',
    off: 'Sacar del aire',
    again: 'Escribir otro',
    story: 'Para tu historia (9:16)',
    landscape: 'Horizontal (16:9)',
    share: 'Compartir para historia',
    making: 'Preparando…',
    file: 'zocalo-nicolascoudouy.png',
    checks: ['MAYÚSCULAS', `${MAX_CHARS} MÁX.`, '2 RENGLONES'],
    playlist: 'Playlist del programa',
    learnTitle: 'Lo que tenés que saber',
    learn: [
      { b: `${MAX_CHARS} caracteres por renglón`, t: 'Es lo que entra en pantalla con la letra del canal. Más largo, se corta o no se llega a leer desde el sillón.' },
      { b: 'Mayúsculas y lugar fijo', t: 'Volanta arriba y título abajo, o nombre arriba y cargo abajo. Así nadie duda qué va en cada lugar con el programa en vivo.' },
      { b: 'La máquina prepara, la persona decide', t: 'La automatización deja todo cargado antes del programa. El momento exacto en que sale lo elige el operador de gráfica, mirando lo que pasa en vivo.' },
    ],
    canalTitle: 'Así lo hacemos en el canal',
    canalText: 'En Canal 8 la producción escribe el rundown en Airtable. Con el conversor que armé, los zócalos de un programa (unos 39) pasan a Squid en 5 minutos. Antes, tipearlos uno por uno llevaba media hora.',
    canalLink: 'Ver el caso y el tutorial',
  },
  en: {
    kinds: { nombre: 'Name and role', volanta: 'Header and headline' },
    kindLabel: 'Lower third type',
    labels: { nombre: ['Name', 'Role or what you do'], volanta: ['Header', 'Headline'] },
    placeholders: { nombre: ['Your name', 'What you do'], volanta: ['Weather', 'A sunny weekend is on the way'] },
    empty: { nombre: ['YOUR NAME', 'WHAT YOU DO'], volanta: ['HEADER', 'YOUR STORY’S HEADLINE'] },
    examples: 'Try',
    exampleList: [
      { label: 'An interviewee', z: { kind: 'nombre', top: 'Martín Sosa', main: 'Head lifeguard' } },
      { label: 'A news story', z: { kind: 'volanta', top: 'Weather', main: 'A sunny weekend is on the way' } },
      { label: 'A really long one', z: { kind: 'volanta', top: 'Traffic', main: 'Road closures and detours downtown because of the works on Colón avenue' } },
    ] as { label: string; z: Zocalo }[],
    rules: {
      length: `Up to ${MAX_CHARS} characters per line`,
      caps: 'All in capitals',
      capsFixed: 'All in capitals (I fix it, like the converter does)',
      both: 'Both lines filled in',
    },
    over: (n: number) => `${n} too many: it won’t fit on screen.`,
    send: 'Send to graphics',
    sendHint: 'Fill in both lines and keep them within 47 characters.',
    pvw: 'PREVIEW',
    pgm: 'ON AIR',
    sim: 'SIMULATOR',
    pipeTitle: 'The journey',
    steps: [
      { tag: 'AIRTABLE', title: 'The sheet', text: 'Producers type each lower third into a shared sheet (Airtable), on the row of its story.' },
      { tag: 'CSV', title: 'The file', text: 'The sheet is downloaded as CSV: plain text, one line per lower third, readable by any program.' },
      { tag: 'CONVERTER', title: 'The converter', text: 'The program I built checks the rules (capitals, 47 characters max) and builds the file the graphics system understands.' },
      { tag: 'SQUID', title: 'Graphics', text: 'Squid, the channel’s graphics system, loads it into the show’s list. It’s ready, but not on air yet.' },
    ],
    idle: 'Write your lower third and send it to graphics to see the journey.',
    operator: 'Machines prepare, people decide: at the channel, the graphics operator picks the exact moment. Now it’s your call.',
    take: 'Put it on air',
    onAir: 'You’re on air! This is how it looks on TV.',
    off: 'Take it off air',
    again: 'Write another one',
    story: 'For your story (9:16)',
    landscape: 'Landscape (16:9)',
    share: 'Share to your story',
    making: 'Preparing…',
    file: 'lower-third-nicolascoudouy.png',
    checks: ['CAPITALS', `${MAX_CHARS} MAX`, '2 LINES'],
    playlist: 'Show playlist',
    learnTitle: 'What to know',
    learn: [
      { b: `${MAX_CHARS} characters per line`, t: 'That’s what fits on screen with the channel’s font. Longer, and it gets cut off or can’t be read from the couch.' },
      { b: 'Capitals and a fixed place', t: 'Header on top and headline below, or name on top and role below. Nobody has to wonder what goes where during a live show.' },
      { b: 'Machines prepare, people decide', t: 'Automation loads everything before the show. The exact moment it goes on air is chosen by the graphics operator, watching what happens live.' },
    ],
    canalTitle: 'How we do it at the channel',
    canalText: 'At Canal 8, producers write the rundown in Airtable. With the converter I built, a show’s lower thirds (about 39) reach Squid in 5 minutes. Typing them one by one used to take half an hour.',
    canalLink: 'See the case and the tutorial',
  },
};

type Phase = 'edit' | 'sending' | 'ready' | 'air';

/** The lower third drawn in HTML (the download draws the same thing on a canvas). */
function LowerThird({ z, empty, live, take }: { z: Zocalo; empty: [string, string]; live: boolean; take: number }) {
  const top = toAir(z.top) || empty[0];
  const main = toAir(z.main) || empty[1];
  return (
    <div key={live ? `air-${take}` : 'pvw'} className={`zx-lt zx-${z.kind}${live ? ' in' : ''}`} aria-hidden="true">
      <span className="zx-top">{top}</span>
      <span className="zx-main">{main}</span>
    </div>
  );
}

export default function ZocaloExplainer() {
  const c = useCopy(COPY);
  const reduce = useReducedMotion();
  const [z, setZ] = useState<Zocalo>({ kind: 'nombre', top: '', main: '' });
  const [phase, setPhase] = useState<Phase>('edit');
  const [step, setStep] = useState(-1);
  const [take, setTake] = useState(0);
  const [busy, setBusy] = useState<'' | 'story' | 'landscape'>('');
  const timers = useRef<number[]>([]);
  const tvRef = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLInputElement>(null);

  const check = checkZocalo(z);
  const onAir = phase === 'air';
  const empty = c.empty[z.kind] as [string, string];

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  /** Any edit takes the lower third back to the start. */
  const edit = (next: Partial<Zocalo>) => {
    clearTimers();
    setZ((cur) => ({ ...cur, ...next }));
    setPhase('edit');
    setStep(-1);
  };

  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 60 || r.bottom > window.innerHeight) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!check.ready) return;
    clearTimers();
    setPhase('sending');
    scrollTo(pipeRef.current);
    if (reduce) {
      setStep(4);
      setPhase('ready');
      return;
    }
    setStep(0);
    for (let i = 1; i <= 4; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setStep(i);
          if (i === 4) setPhase('ready');
        }, STEP_MS * i),
      );
    }
  };

  const goOnAir = () => {
    setPhase('air');
    setTake((n) => n + 1);
    scrollTo(tvRef.current);
  };

  const again = () => {
    edit({ top: '', main: '' });
    topRef.current?.focus();
  };

  const download = async (vertical: boolean) => {
    setBusy(vertical ? 'story' : 'landscape');
    try {
      const blob = await zocaloPng(z, vertical);
      const file = new File([blob], c.file, { type: 'image/png' });
      // On phones, the share sheet goes straight to Instagram or WhatsApp.
      if (vertical && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = c.file;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } finally {
      setBusy('');
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && /Android|iPhone|iPad/i.test(navigator.userAgent);
  const [l1, l2] = c.labels[z.kind];
  const [p1, p2] = c.placeholders[z.kind];
  const overTop = Math.max(0, check.top - MAX_CHARS);
  const overMain = Math.max(0, check.main - MAX_CHARS);
  const stepText = phase === 'edit' ? c.idle : step >= 4 ? (onAir ? c.onAir : c.operator) : c.steps[Math.max(0, step)].text;

  return (
    <div className="zx">
      <div className="zx-studio">
        <div className="zx-monitor" ref={tvRef}>
          <div className={`zx-tally${onAir ? ' on' : ''}`}><i aria-hidden="true" />{onAir ? c.pgm : c.pvw}</div>
          <div className={`zx-tv${onAir ? ' air' : ''}`}>
            <span className="zx-sim mono"><i aria-hidden="true" />{c.sim}</span>
            <span className="zx-bug" aria-hidden="true">NC</span>
            <LowerThird z={z} empty={empty} live={onAir} take={take} />
          </div>
          {onAir && (
            <div className="zx-after">
              <button type="button" className="btn primary" onClick={() => download(true)} disabled={!!busy}>
                {busy === 'story' ? c.making : canShareFiles ? c.share : c.story}
              </button>
              <button type="button" className="btn" onClick={() => download(false)} disabled={!!busy}>{busy === 'landscape' ? c.making : c.landscape}</button>
              <button type="button" className="btn ghost-btn" onClick={() => setPhase('ready')}>{c.off}</button>
              <button type="button" className="link-btn" onClick={again}>{c.again}</button>
            </div>
          )}
        </div>

        <form className="zx-form" onSubmit={send}>
          <div className="chips zx-kind" role="group" aria-label={c.kindLabel}>
            {(['nombre', 'volanta'] as ZocaloKind[]).map((k) => (
              <button key={k} type="button" className="chip" aria-pressed={z.kind === k} onClick={() => edit({ kind: k })}>{c.kinds[k]}</button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="zx-top">{l1}</label>
            <input id="zx-top" ref={topRef} value={z.top} maxLength={90} placeholder={p1} autoComplete="off"
              aria-invalid={overTop > 0} aria-describedby="zx-top-n" onChange={(e) => edit({ top: e.target.value })} />
            <small id="zx-top-n" className={`zx-count${overTop ? ' bad' : ''}`}>{check.top}/{MAX_CHARS}{overTop ? ` · ${c.over(overTop)}` : ''}</small>
          </div>
          <div className="field">
            <label htmlFor="zx-main">{l2}</label>
            <input id="zx-main" value={z.main} maxLength={90} placeholder={p2} autoComplete="off"
              aria-invalid={overMain > 0} aria-describedby="zx-main-n" onChange={(e) => edit({ main: e.target.value })} />
            <small id="zx-main-n" className={`zx-count${overMain ? ' bad' : ''}`}>{check.main}/{MAX_CHARS}{overMain ? ` · ${c.over(overMain)}` : ''}</small>
          </div>

          <div className="zx-examples">
            <span className="mono">{c.examples}</span>
            {c.exampleList.map((ex) => (
              <button key={ex.label} type="button" className="chip" onClick={() => edit(ex.z)}>{ex.label}</button>
            ))}
          </div>

          <ul className="zx-rules">
            <li className={check.top <= MAX_CHARS && check.main <= MAX_CHARS ? 'ok' : 'bad'}>{c.rules.length}</li>
            <li className="ok">{check.fixedCase ? c.rules.capsFixed : c.rules.caps}</li>
            <li className={check.top > 0 && check.main > 0 ? 'ok' : ''}>{c.rules.both}</li>
          </ul>

          <button type="submit" className="btn primary zx-send" disabled={!check.ready} aria-describedby={check.ready ? undefined : 'zx-hint'}>{c.send}</button>
          {!check.ready && <small id="zx-hint" className="zx-hint">{c.sendHint}</small>}
        </form>
      </div>

      <div className="zx-pipe" ref={pipeRef}>
        <div className="zx-pipe-head mono">{c.pipeTitle}</div>
        <ol className="zx-steps">
          {c.steps.map((s, i) => {
            const state = phase === 'edit' ? '' : step > i ? 'done' : step === i ? 'active' : '';
            return (
              <li key={s.tag} className={`zx-node ${state}`}>
                <span className="zx-node-tag mono">{String(i + 1).padStart(2, '0')} · {s.tag}</span>
                <b>{s.title}</b>
                <span className="zx-node-body">
                  {i === 0 && (
                    <span className="zx-sheet"><span>N51300</span><span>{toAir(z.top) || empty[0]}<br />{toAir(z.main) || empty[1]}</span></span>
                  )}
                  {i === 1 && <code className="zx-csv">{csvLine({ ...z, top: z.top || empty[0], main: z.main || empty[1] })}</code>}
                  {i === 2 && (
                    <span className="zx-checks">
                      {c.checks.map((k, j) => <span key={k} className={state === 'done' || (state === 'active' && j === 0) ? 'on' : ''}>✓ {k}</span>)}
                    </span>
                  )}
                  {i === 3 && (
                    <span className="zx-playlist"><small>{c.playlist}</small><span>N51300 · {toAir(z.top) || empty[0]}</span></span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="zx-explain" aria-live="polite">{stepText}</p>

        {phase === 'ready' && (
          <button type="button" className="zx-take" onClick={goOnAir}><i aria-hidden="true" />{c.take}</button>
        )}
      </div>

      <div className="zx-learn">
        <h2 className="zx-learn-title mono">{c.learnTitle}</h2>
        <ol className="zx-keys">
          {c.learn.map((k) => <li key={k.b}><b>{k.b}</b><span>{k.t}</span></li>)}
        </ol>
        <aside className="zx-canal">
          <span className="zx-canal-tag mono"><i aria-hidden="true" />{c.canalTitle}</span>
          <p>{c.canalText}</p>
          <Link to="/proyectos" className="hw-link">{c.canalLink} →</Link>
        </aside>
      </div>
    </div>
  );
}
