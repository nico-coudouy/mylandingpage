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

export async function askAssistant(messages: ChatMessage[], lang: Lang): Promise<ChatReply> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, lang }),
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
