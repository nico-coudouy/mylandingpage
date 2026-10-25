import { useEffect, useRef, useState, type FormEvent } from 'react';
import { askAssistant, type ChatMessage } from '../lib/chat';
import { useCopy, useLang } from '../i18n';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { tokenize } from '../lib/richText';

const COPY = {
  es: {
    eyebrow: 'Asistente con IA',
    title: 'Conectado desde 2005.',
    lead: 'Un guiño al Messenger con el que aprendimos a chatear, con IA de hoy: responde sobre mis proyectos, mi experiencia y cómo contactarme. Probá el zumbido.',
    window: 'Conversación con Nico',
    name: 'Nico (asistente)',
    status: 'Disponible',
    personal: '♪ Escuchando: Soda Stereo',
    botSays: 'Nico dice:',
    youSay: 'Vos decís:',
    greeting: 'Hola, soy el asistente de Nico. Preguntame por sus proyectos, su experiencia o cómo contactarlo :)',
    suggestions: ['¿Qué tecnologías usás?', '¿Hiciste webs para clientes?', '¿Estás disponible para trabajar?', '¿Cómo te contacto?'],
    placeholder: 'Escribí tu mensaje',
    limitedPlaceholder: 'Llegaste al límite de hoy',
    question: 'Tu mensaje',
    send: 'Enviar',
    typing: 'Nico está escribiendo un mensaje…',
    lastAt: (t: string) => `Último mensaje recibido a las ${t}`,
    nudge: 'Zumbido', sound: 'Sonido', clear: 'Borrar',
    nudgeSent: 'Enviaste un zumbido.',
    nudgeReplies: [
      '¡Epa! Acá estoy. ¿En qué te ayudo? :D',
      'Zumbido recibido (y) Preguntame lo que quieras sobre Nico.',
      '¡Me hiciste temblar la ventana! ;) ¿Qué querés saber?',
    ],
    remaining: (n: number) => `Te quedan ${n} ${n === 1 ? 'pregunta' : 'preguntas'} hoy. El zumbido no cuenta.`,
    limit: 'Podés hacer hasta 10 preguntas por día. El zumbido no cuenta.',
  },
  en: {
    eyebrow: 'AI assistant',
    title: 'Online since 2005.',
    lead: 'A nod to the Messenger many of us learned to chat on, powered by today’s AI: it answers questions about my projects, my experience and how to reach me. Try the nudge.',
    window: 'Conversation with Nico',
    name: 'Nico (assistant)',
    status: 'Available',
    personal: '♪ Listening to: Soda Stereo',
    botSays: 'Nico says:',
    youSay: 'You say:',
    greeting: "Hi, I'm Nico's assistant. Ask me about his projects, his experience or how to reach him :)",
    suggestions: ['What technologies do you use?', 'Have you built websites for clients?', 'Are you available for work?', 'How can I contact you?'],
    placeholder: 'Type your message',
    limitedPlaceholder: "You've reached today's limit",
    question: 'Your message',
    send: 'Send',
    typing: 'Nico is typing a message…',
    lastAt: (t: string) => `Last message received at ${t}`,
    nudge: 'Nudge', sound: 'Sound', clear: 'Clear',
    nudgeSent: 'You sent a nudge.',
    nudgeReplies: [
      'Whoa! I’m here. How can I help? :D',
      'Nudge received (y) Ask me anything about Nico.',
      'You made my window shake! ;) What would you like to know?',
    ],
    remaining: (n: number) => `${n} ${n === 1 ? 'question' : 'questions'} left today. Nudges don't count.`,
    limit: "You can ask up to 10 questions a day. Nudges don't count.",
  },
};

const MAX_CHARS = 500;
const HISTORY_SENT = 8;

type Line = { role: 'user' | 'assistant' | 'event'; content: string; time: string; local?: boolean };

/** Renders an answer with clickable emails, sites and WhatsApp numbers. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((t, i) => {
        const body = t.bold ? <strong>{t.text}</strong> : t.text;
        return t.type === 'link'
          ? <a key={i} href={t.href} {...(t.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>
          : <span key={i}>{body}</span>;
      })}
    </>
  );
}

const clock = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

/** Tiny synthesized sounds (no audio files): a two-note ding and a low buzz for the nudge. */
function useSound() {
  const ctx = useRef<AudioContext | null>(null);
  return (kind: 'ding' | 'buzz') => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx.current ??= new AC();
      const c = ctx.current, t = c.currentTime;
      const tone = (f: number, at: number, dur: number, type: OscillatorType, vol: number) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0, t + at);
        g.gain.linearRampToValueAtTime(vol, t + at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
        o.connect(g); g.connect(c.destination);
        o.start(t + at); o.stop(t + at + dur + 0.05);
      };
      if (kind === 'ding') { tone(880, 0, 0.25, 'sine', 0.12); tone(1320, 0.12, 0.35, 'sine', 0.1); }
      else for (let i = 0; i < 6; i++) tone(i % 2 ? 110 : 130, i * 0.07, 0.08, 'square', 0.05);
    } catch { /* sound is optional */ }
  };
}

export default function Assistant() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const reduce = useReducedMotion();
  // The greeting is rendered separately so it follows the language toggle.
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limited, setLimited] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [shake, setShake] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const lastNudge = useRef(0);
  const play = useSound();

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, busy]);

  const ask = async (question: string) => {
    const q = question.trim().slice(0, MAX_CHARS);
    if (!q || busy || limited) return;
    const next: Line[] = [...lines, { role: 'user', content: q, time: clock() }];
    setLines(next);
    setBusy(true);
    // Only real questions and answers go to the model; nudges stay local.
    const history: ChatMessage[] = next
      .filter((l) => l.role !== 'event' && !l.local)
      .map((l) => ({ role: l.role as 'user' | 'assistant', content: l.content }));
    const reply = await askAssistant(history.slice(-HISTORY_SENT), lang);
    setLines((m) => [...m, { role: 'assistant', content: reply.answer, time: clock() }]);
    if (soundOn) play('ding');
    if (reply.remaining !== null) setRemaining(reply.remaining);
    if (reply.limited) setLimited(true);
    setBusy(false);
  };

  const nudge = () => {
    const now = Date.now();
    if (now - lastNudge.current < 2500 || busy) return;
    lastNudge.current = now;
    setShake(true);
    setTimeout(() => setShake(false), 650);
    try { navigator.vibrate?.([80, 40, 80]); } catch { /* not supported */ }
    if (soundOn) play('buzz');
    const pick = c.nudgeReplies[Math.floor(Math.random() * c.nudgeReplies.length)];
    setLines((m) => [...m, { role: 'event', content: c.nudgeSent, time: clock() }]);
    setTimeout(() => {
      setLines((m) => [...m, { role: 'assistant', content: pick, time: clock(), local: true }]);
      if (soundOn) play('ding');
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input;
    setInput('');
    ask(q);
  };

  const lastBot = [...lines].reverse().find((l) => l.role === 'assistant');

  return (
    <section className="sec" id="asistente" style={{ paddingTop: 0 }}>
      <div className="wrap ai">
        <div className="sec-head" style={{ margin: 0 }}>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p className="lead" style={{ margin: 0 }}>{c.lead}</p>
          <div className="tags"><span className="tag">Groq</span><span className="tag">GPT-OSS 120B</span><span className="tag">Vercel Functions</span></div>
        </div>
        <div>
          <div className={`msn${shake ? (reduce ? ' flash' : ' shake') : ''}`}>
            <div className="msn-title">
              <span className="msn-ico" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z" fill="currentColor" /></svg>
              </span>
              <span>{c.window}</span>
              <span className="msn-win" aria-hidden="true"><i>–</i><i>□</i><i>✕</i></span>
            </div>

            <div className="msn-tools" role="toolbar" aria-label={c.window}>
              <button type="button" onClick={nudge}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                {c.nudge}
              </button>
              <button type="button" onClick={() => setSoundOn(!soundOn)} aria-pressed={soundOn}>
                {soundOn ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                )}
                {c.sound}
              </button>
              <button type="button" onClick={() => setLines([])} disabled={!lines.length || busy}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {c.clear}
              </button>
            </div>

            <div className="msn-contact">
              <span className="msn-dp"><img src="/assets/nico.jpg" alt="" width={56} height={56} /></span>
              <div>
                <b>{c.name}</b>
                <span className="msn-status"><i />{c.status}</span>
                <span className="msn-personal">{c.personal}</span>
              </div>
            </div>

            <div className="msn-thread" ref={threadRef} aria-live="polite">
              <div className="msn-msg">
                <span className="who bot">{c.botSays}</span>
                <p><Rich text={c.greeting} /></p>
              </div>
              {lines.map((l, k) => l.role === 'event' ? (
                <div key={k} className="msn-event">— {l.content} —</div>
              ) : (
                <div key={k} className="msn-msg">
                  <span className={`who ${l.role === 'user' ? 'me' : 'bot'}`}>{l.role === 'user' ? c.youSay : c.botSays}<time>{l.time}</time></span>
                  <p><Rich text={l.content} /></p>
                </div>
              ))}
            </div>

            {lines.length === 0 && (
              <div className="sugg msn-sugg">
                {c.suggestions.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
              </div>
            )}

            <form className="msn-form" onSubmit={onSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={limited ? c.limitedPlaceholder : c.placeholder}
                aria-label={c.question}
                autoComplete="off"
                maxLength={MAX_CHARS}
                disabled={limited}
              />
              <button type="submit" disabled={busy || limited}>{c.send}</button>
            </form>
            <div className="msn-bar">{busy ? c.typing : lastBot ? c.lastAt(lastBot.time) : ' '}</div>
          </div>
          <p className="note">{remaining !== null ? c.remaining(remaining) : c.limit}</p>
        </div>
      </div>
    </section>
  );
}
