import { useEffect, useRef, useState, type FormEvent } from 'react';
import { askAssistant, type ChatMessage } from '../lib/chat';
import { SendIcon } from './Icons';

const SUGGESTIONS = [
  '¿Qué tecnologías usás?',
  '¿Hiciste webs para clientes?',
  '¿Estás disponible para trabajar?',
  '¿Cómo te contacto?',
];
const GREETING: ChatMessage = {
  role: 'assistant',
  content: 'Hola, soy el asistente de Nico. Preguntame por sus proyectos, su experiencia o cómo contactarlo.',
};
const MAX_CHARS = 500;
const HISTORY_SENT = 8;

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
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
    // The greeting is UI only; send the recent conversation.
    const reply = await askAssistant(next.slice(1).slice(-HISTORY_SENT));
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
          <span className="eyebrow">Asistente con IA</span>
          <h2>Preguntale a mi asistente.</h2>
          <p className="lead" style={{ margin: 0 }}>
            Responde sobre mis proyectos, mi experiencia y cómo contactarme. Usa la misma tecnología que Bot Pilot, mis chatbots para negocios.
          </p>
          <div className="tags"><span className="tag">Groq</span><span className="tag">Llama 3.3</span><span className="tag">Vercel Functions</span></div>
        </div>
        <div>
          <div className="chat">
            <div className="chat-head">
              <div className="av" />
              <div><b>Asistente de Nico</b><small>● EN LÍNEA</small></div>
            </div>
            <div className="thread" ref={threadRef} aria-live="polite">
              {messages.map((m, k) => (
                <div key={k} className={`msg ${m.role === 'user' ? 'me' : 'bot'}`}>{m.content}</div>
              ))}
              {busy && <div className="typing" aria-label="Escribiendo"><i /><i /><i /></div>}
            </div>
            {messages.length === 1 && (
              <div className="sugg">
                {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
              </div>
            )}
            <form onSubmit={onSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={limited ? 'Llegaste al límite de hoy' : 'Escribí tu pregunta'}
                aria-label="Tu pregunta"
                autoComplete="off"
                maxLength={MAX_CHARS}
                disabled={limited}
              />
              <button type="submit" aria-label="Enviar" disabled={busy || limited}><SendIcon /></button>
            </form>
          </div>
          <p className="note">
            {remaining !== null
              ? `Te quedan ${remaining} ${remaining === 1 ? 'pregunta' : 'preguntas'} hoy.`
              : 'Podés hacer hasta 10 preguntas por día.'}
          </p>
        </div>
      </div>
    </section>
  );
}
