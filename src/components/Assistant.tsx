import { useEffect, useRef, useState, type FormEvent } from 'react';
import { askAssistant, type ChatMessage } from '../lib/chat';
import { useCopy, useLang } from '../i18n';
import { SendIcon } from './Icons';

const COPY = {
  es: {
    eyebrow: 'Asistente con IA',
    title: 'Preguntale a mi asistente.',
    lead: 'Responde sobre mis proyectos, mi experiencia y cómo contactarme. Usa la misma tecnología que Bot Pilot, mis chatbots para negocios.',
    name: 'Asistente de Nico',
    online: '● EN LÍNEA',
    greeting: 'Hola, soy el asistente de Nico. Preguntame por sus proyectos, su experiencia o cómo contactarlo.',
    suggestions: ['¿Qué tecnologías usás?', '¿Hiciste webs para clientes?', '¿Estás disponible para trabajar?', '¿Cómo te contacto?'],
    placeholder: 'Escribí tu pregunta',
    limitedPlaceholder: 'Llegaste al límite de hoy',
    question: 'Tu pregunta',
    send: 'Enviar',
    typing: 'Escribiendo',
    remaining: (n: number) => `Te quedan ${n} ${n === 1 ? 'pregunta' : 'preguntas'} hoy.`,
    limit: 'Podés hacer hasta 10 preguntas por día.',
  },
  en: {
    eyebrow: 'AI assistant',
    title: 'Ask my assistant.',
    lead: 'It answers questions about my projects, my experience and how to reach me. It runs on the same technology as Bot Pilot, my chatbots for businesses.',
    name: "Nico's assistant",
    online: '● ONLINE',
    greeting: "Hi, I'm Nico's assistant. Ask me about his projects, his experience or how to reach him.",
    suggestions: ['What technologies do you use?', 'Have you built websites for clients?', 'Are you available for work?', 'How can I contact you?'],
    placeholder: 'Type your question',
    limitedPlaceholder: "You've reached today's limit",
    question: 'Your question',
    send: 'Send',
    typing: 'Typing',
    remaining: (n: number) => `${n} ${n === 1 ? 'question' : 'questions'} left today.`,
    limit: 'You can ask up to 10 questions a day.',
  },
};

const MAX_CHARS = 500;
const HISTORY_SENT = 8;

export default function Assistant() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  // The greeting is rendered separately so it follows the language toggle.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limited, setLimited] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const ask = async (question: string) => {
    const q = question.trim().slice(0, MAX_CHARS);
    if (!q || busy || limited) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setBusy(true);
    const reply = await askAssistant(next.slice(-HISTORY_SENT), lang);
    setMessages((m) => [...m, { role: 'assistant', content: reply.answer }]);
    if (reply.remaining !== null) setRemaining(reply.remaining);
    if (reply.limited) setLimited(true);
    setBusy(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input;
    setInput('');
    ask(q);
  };

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
          <div className="chat">
            <div className="chat-head">
              <div className="av" />
              <div><b>{c.name}</b><small>{c.online}</small></div>
            </div>
            <div className="thread" ref={threadRef} aria-live="polite">
              <div className="msg bot">{c.greeting}</div>
              {messages.map((m, k) => (
                <div key={k} className={`msg ${m.role === 'user' ? 'me' : 'bot'}`}>{m.content}</div>
              ))}
              {busy && <div className="typing" aria-label={c.typing}><i /><i /><i /></div>}
            </div>
            {messages.length === 0 && (
              <div className="sugg">
                {c.suggestions.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
              </div>
            )}
            <form onSubmit={onSubmit}>
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
              <button type="submit" aria-label={c.send} disabled={busy || limited}><SendIcon /></button>
            </form>
          </div>
          <p className="note">{remaining !== null ? c.remaining(remaining) : c.limit}</p>
        </div>
      </div>
    </section>
  );
}
