import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useCopy, useLang } from '../../i18n';

/* ───────── sample data (invented gyms, nothing touches the real app) ───────── */

type Gym = { id: string; name: string; short: string; color: string; bg: string; classes: [string, string, number][] };

const GYMS: Gym[] = [
  { id: 'faro', name: 'Faro Box', short: 'FARO', color: '#3DE0FF', bg: '#0D2A33',
    classes: [['07:00', 'CrossFit', 15], ['08:00', 'CrossFit', 15], ['12:30', 'Halterofilia', 10], ['19:00', 'CrossFit', 15], ['20:00', 'Open box', 20]] },
  { id: 'hierro', name: 'Hierro CrossFit', short: 'HCF', color: '#FF6A5C', bg: '#33140F',
    classes: [['07:30', 'Funcional', 12], ['09:00', 'Movilidad', 10], ['18:00', 'CrossFit', 14], ['19:30', 'Funcional', 12]] },
  { id: 'brava', name: 'Brava Training', short: 'BRV', color: '#B39CFF', bg: '#231B3D',
    classes: [['08:00', 'Yoga', 12], ['10:00', 'Pilates', 8], ['18:30', 'Funcional', 16], ['20:00', 'Spinning', 14]] },
];
const START_CREDITS = 8;

const COPY = {
  es: {
    open: 'Probar la app',
    title: 'Demo de Tiza',
    note: 'Demo con datos de ejemplo. La app real usa Supabase con usuarios, cupos y créditos.',
    reset: 'Reiniciar demo', close: 'Cerrar demo',
    pick: 'Elegí tu gimnasio', tagline: 'Los turnos de tu gimnasio, en dos toques.',
    hello: 'Hola, invitado', book: 'Reservá tu clase', back: 'Cambiar de gimnasio',
    next: 'PRÓXIMA CLASE', none: 'Todavía no reservaste.', credits: 'CRÉDITOS', expires: 'Vencen en 30 días',
    today: 'Hoy', closed: 'Los domingos el gimnasio está cerrado.',
    reserve: 'Reservar', reserved: 'Reservado ✓', full: 'Completa', past: 'Finalizada',
    free: (n: number, t: number) => `${n} lugares libres de ${t}`,
    tabs: ['Clases', 'Mis turnos'],
    myEmpty: 'No tenés turnos. Reservá una clase desde la pestaña Clases.',
    cancel: 'Cancelar',
    toastBooked: (d: string) => `Clase reservada · ${d}`,
    toastCancel: 'Turno cancelado · se devolvió el crédito',
    toastNoCredits: 'No te quedan créditos',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    min: 'min',
  },
  en: {
    open: 'Try the app',
    title: 'Tiza demo',
    note: 'Demo with sample data. The real app uses Supabase with accounts, class limits and credits.',
    reset: 'Reset demo', close: 'Close demo',
    pick: 'Pick your gym', tagline: 'Your gym’s classes, booked in two taps.',
    hello: 'Hi, guest', book: 'Book your class', back: 'Change gym',
    next: 'NEXT CLASS', none: 'No bookings yet.', credits: 'CREDITS', expires: 'Expire in 30 days',
    today: 'Today', closed: 'The gym is closed on Sundays.',
    reserve: 'Book', reserved: 'Booked ✓', full: 'Full', past: 'Finished',
    free: (n: number, t: number) => `${n} of ${t} spots left`,
    tabs: ['Classes', 'My bookings'],
    myEmpty: 'No bookings yet. Book a class from the Classes tab.',
    cancel: 'Cancel',
    toastBooked: (d: string) => `Class booked · ${d}`,
    toastCancel: 'Booking cancelled · credit refunded',
    toastNoCredits: 'You have no credits left',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    min: 'min',
  },
};

/** Stable "already taken" spots per class and day, so the demo looks lived-in. */
function taken(gym: string, day: string, time: string, cap: number) {
  let h = 0;
  for (const ch of gym + day + time) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = h % 100;
  return r < 18 ? cap : Math.min(cap - 1, Math.round((r / 100) * cap));
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

type Booking = { key: string; gym: string; day: string; time: string; name: string };

function App({ onToast }: { onToast: (s: string) => void }) {
  const c = useCopy(COPY);
  const [gymId, setGymId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [credits, setCredits] = useState<Record<string, number>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pop, setPop] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  }), []);

  const gym = GYMS.find((g) => g.id === gymId) ?? null;
  const left = gym ? credits[gym.id] ?? START_CREDITS : 0;
  const day = days[dayIdx];
  const dayKey = iso(day);
  const dayLabel = (d: Date, i: number) => (i === 0 ? c.today : c.days[d.getDay()]);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const mine = bookings.filter((b) => b.gym === gymId).sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time));
  const nextOne = mine[0];
  const fmtDay = (k: string) => {
    const i = days.findIndex((d) => iso(d) === k);
    const d = days[i] ?? new Date(k);
    return `${dayLabel(d, i)} ${d.getDate()}`;
  };

  const reserve = (time: string, name: string) => {
    if (!gym) return;
    if (left <= 0) { onToast(c.toastNoCredits); return; }
    const key = `${gym.id}|${dayKey}|${time}`;
    setBookings((b) => [...b, { key, gym: gym.id, day: dayKey, time, name }]);
    setCredits((x) => ({ ...x, [gym.id]: left - 1 }));
    setPop(key);
    setTimeout(() => setPop(null), 400);
    onToast(c.toastBooked(`${fmtDay(dayKey)} · ${time}`));
  };

  const cancel = (key: string) => {
    if (!gym) return;
    setBookings((b) => b.filter((x) => x.key !== key));
    setCredits((x) => ({ ...x, [gym.id]: (x[gym.id] ?? START_CREDITS) + 1 }));
    onToast(c.toastCancel);
  };

  if (!gym) {
    return (
      <div className="tz-screen tz-pick">
        <div className="tz-logo">Tiza<i>.</i></div>
        <p className="tz-sub">{c.tagline}</p>
        <h4>{c.pick}</h4>
        {GYMS.map((g) => (
          <button key={g.id} type="button" className="tz-gym" onClick={() => { setGymId(g.id); setTab(0); setDayIdx(0); }}>
            <span className="tz-mark" style={{ background: g.bg, color: g.color }}>{g.short}</span>
            <b>{g.name}</b>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
        ))}
      </div>
    );
  }

  const closed = day.getDay() === 0;

  return (
    <div className="tz-screen" style={{ '--acc': gym.color } as CSSProperties}>
      <div className="tz-head">
        <button type="button" className="tz-back" onClick={() => setGymId(null)} aria-label={c.back}>‹</button>
        <span className="tz-mark sm" style={{ background: gym.bg, color: gym.color }}>{gym.short}</span>
        <b>{gym.name.toUpperCase()}</b>
      </div>
      <div className="tz-body">
        {tab === 0 ? (
          <>
            <p className="tz-hello">{c.hello}</p>
            <h3 className="tz-h">{c.book}</h3>
            <div className="tz-duo">
              <div className="tz-mini">
                <small>{c.next}</small>
                {nextOne ? <p className="acc">{fmtDay(nextOne.day)} · {nextOne.time} · {nextOne.name}</p> : <p>{c.none}</p>}
              </div>
              <div className="tz-mini">
                <small>{c.credits}</small>
                <b key={left} className="tz-cred">{left}</b>
                <span>{c.expires}</span>
              </div>
            </div>
            <div className="tz-days" role="tablist">
              {days.map((d, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === dayIdx} className={`${i === dayIdx ? 'on' : ''}${d.getDay() === 0 ? ' off' : ''}`} onClick={() => setDayIdx(i)}>
                  {dayLabel(d, i)}<b>{d.getDate()}</b>
                </button>
              ))}
            </div>
            {closed ? <p className="tz-empty">{c.closed}</p> : gym.classes.map(([time, name, cap]) => {
              const key = `${gym.id}|${dayKey}|${time}`;
              const mineHere = bookings.some((b) => b.key === key);
              const used = taken(gym.id, dayKey, time, cap) + (mineHere ? 1 : 0);
              const full = used >= cap && !mineHere;
              const [hh, mm] = time.split(':').map(Number);
              const past = dayIdx === 0 && hh * 60 + mm <= nowMin;
              return (
                <div key={time} className={`tz-cls${past ? ' past' : ''}`}>
                  <div className="tz-row">
                    <div><div className="tz-hr">{time}</div><small>{name} · 60 {c.min}</small></div>
                    {past ? <span className="tz-tag">{c.past}</span>
                      : mineHere ? <button type="button" className={`tz-btn done${pop === key ? ' pop' : ''}`} onClick={() => cancel(key)} title={c.cancel}>{c.reserved}</button>
                      : full ? <span className="tz-tag full">{c.full}</span>
                      : <button type="button" className="tz-btn" onClick={() => reserve(time, name)}>{c.reserve}</button>}
                  </div>
                  <div className="tz-bar"><i style={{ transform: `scaleX(${Math.min(1, used / cap)})` }} /></div>
                  <div className="tz-free">{c.free(Math.max(0, cap - used), cap)}</div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <h3 className="tz-h">{c.tabs[1]}</h3>
            {mine.length === 0 ? <p className="tz-empty">{c.myEmpty}</p> : mine.map((b) => (
              <div key={b.key} className="tz-cls">
                <div className="tz-row">
                  <div><div className="tz-hr">{b.time}</div><small>{fmtDay(b.day)} · {b.name}</small></div>
                  <button type="button" className="tz-btn ghost" onClick={() => cancel(b.key)}>{c.cancel}</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="tz-tabbar" role="tablist">
        {c.tabs.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'on' : undefined} onClick={() => setTab(i)}>
            <span aria-hidden="true" className={i === 0 ? 'ico-cal' : 'ico-list'} />{t}{i === 1 && mine.length > 0 && <em>{mine.length}</em>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "Try the app" button plus the dialog with a working, local-only Tiza demo. */
export default function TizaDemo() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const [run, setRun] = useState(0); // bumping it remounts the app = reset
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const show = () => { setOpen(true); dialog.current?.showModal(); };
  const hide = () => dialog.current?.close();

  return (
    <>
      <button type="button" className="mini-link tz-try" onClick={show}>
        {c.open}
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" /></svg>
      </button>
      <dialog ref={dialog} className="tz-dialog" aria-label={c.title} lang={lang} onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
        <div className="tz-wrap">
          <div className="tz-top">
            <span>{c.title}</span>
            <button type="button" onClick={() => setRun((r) => r + 1)}>{c.reset}</button>
            <button type="button" className="x" onClick={hide} aria-label={c.close}>✕</button>
          </div>
          <div className="tz-phone">
            <div className="tz-notch" aria-hidden="true" />
            {open && <App key={run} onToast={(text) => setToast({ id: Date.now(), text })} />}
            {toast && <div key={toast.id} className="tz-toast" role="status"><i>✓</i>{toast.text}</div>}
          </div>
          <p className="tz-note">{c.note}</p>
        </div>
      </dialog>
    </>
  );
}
