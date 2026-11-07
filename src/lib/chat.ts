import type { Lang } from '../i18n';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type ChatReply = {
  answer: string;
  /** Questions the visitor has left today, when the server reports it. */
  remaining: number | null;
  /** True when the daily limit was reached. */
  limited: boolean;
};

const OFFLINE_ANSWER: Record<Lang, string> = {
  es: 'No pude conectarme con el asistente. Podés escribirle a Nico a nicocoudouy@gmail.com.',
  en: "I couldn't reach the assistant. You can email Nico at nicocoudouy@gmail.com.",
};

/** `tool` is the slug of the tool the visitor has open, so the assistant can help with it. */
export async function askAssistant(messages: ChatMessage[], lang: Lang, tool?: string): Promise<ChatReply> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tool ? { messages, lang, tool } : { messages, lang }),
    });
    const data = await res.json().catch(() => null);
    if (!data || typeof data.answer !== 'string') throw new Error('Invalid response');
    return {
      answer: data.answer,
      remaining: typeof data.remaining === 'number' ? data.remaining : null,
      limited: res.status === 429,
    };
  } catch {
    return { answer: OFFLINE_ANSWER[lang], remaining: null, limited: false };
  }
}

const OPEN_EVENT = 'assistant:open';

/** Opens the chat window from anywhere on the page (for example, a tool's help button). */
export function openAssistant() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenAssistant(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
