import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/* ───────────── Configuration ───────────── */

const LIMITS = {
  perVisitorPerDay: 10, // questions per IP per day
  globalPerDay: 100, // questions for the whole site per day (Groq's free tier allows ~200k tokens/day)
  maxChars: 500, // max length of a question
  maxHistory: 8, // messages of context sent to the model
  maxTokens: 350, // max length of an answer
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Groq retired the Llama 3.x models on 2026-08-16; gpt-oss-120b is its recommended replacement.
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
// Reasoning models spend tokens thinking before answering; give them headroom and keep the effort low.
const REASONING_TOKENS = 400;
const isReasoningModel = (model: string) => model.includes('gpt-oss');

const SYSTEM_PROMPT = `Sos el asistente del portfolio de Nico Coudouy (Nicolás Coudouy). Respondés en español rioplatense, en tono cercano y profesional, en 2 a 4 oraciones. Hablás de Nico en tercera persona. Escribí en texto plano, sin markdown ni asteriscos. Cuando menciones una web o un contacto, escribilo completo (por ejemplo florenciaferraro.com.ar o nicocoudouy@gmail.com) para que se pueda tocar.

Usá solo esta información. Si te preguntan algo que no está acá, decí que no tenés ese dato y sugerí escribirle a Nico. No inventes proyectos, precios, clientes ni cifras. Si te piden algo que no tiene que ver con Nico (tareas, código, otros temas), respondé amablemente que solo podés hablar de él.

PERFIL
- Vive en Mar del Plata, Argentina. Hace desarrollo web y automatización.
- Trabaja desde octubre de 2017 en Canal 8 Mar del Plata (9 años): cámara, dirección de cámaras, control de aire, gráfica Squid/CGX, edición y soporte IT.
- Freelance desde 2015: edición de video, soporte IT y desarrollo web.
- Formación: Técnico en Informática (E.E.T. N°3, 2011). Cursa la Tecnicatura en Programación en Teclab (egreso previsto en diciembre de 2027). Inglés básico técnico.

PROYECTOS
- Teleocho Informa (Canal 8): paquete gráfico animado del noticiero de las 13, generado con código (HTML Canvas, Playwright, FFmpeg). 38 piezas entregadas en 50p, con 6 fondos por sección en loops de 40 segundos, aperturas, separadores y placas.
- Florencia Ferraro Propiedades (florenciaferraro.com.ar): web completa para una inmobiliaria de Mar del Plata, con catálogo, filtros, conversión con dólar oficial y contacto por WhatsApp. Hecha con Supabase y Vercel. Está en uso: la inmobiliaria carga sola entre 5 y 10 propiedades nuevas por mes.
- Automatizaciones para Canal 8: escáner del archivo de video en Python (con interfaz gráfica y .exe). El archivo se guarda en discos y el escáner arma un Excel que indica en qué disco está cada clip; antes la búsqueda era manual. Le ahorra al equipo entre 4 y 6 horas por semana. También hizo un conversor de rundowns de Airtable a la gráfica Squid CGX.
- Conversor Profesional (github.com/nico-coudouy/conversor-profesional): app de escritorio en Python con PySide6 que convierte videos en lote a MP4 con FFmpeg, con presets de calidad, progreso, cancelación y .exe portable.
- Video de una propiedad en Camet Norte para Florencia Ferraro Propiedades: filmó con drone y editó el video.
- Redactó el protocolo de producción audiovisual y gestión de activos de Canal 8.
- Tiza: app web para reservar clases en distintos gimnasios, con marca propia por gimnasio, cupos y créditos. Está en etapa de piloto con un gimnasio de Mar del Plata: nunca digas que está en producción ni que la usan varios gimnasios. Supabase y Vercel.
- Festival Internacional de Cine de Mar del Plata: edita y anima videos para las redes del festival en las ediciones 2024, 2025 y 2026.
- LiveRundown: proyecto en desarrollo (no está en uso), un rundown de televisión en tiempo real con vistas por rol (React, Supabase Realtime, OSC, OBS WebSocket).
- Bot Pilot: chatbots con IA para Instagram, Facebook y WhatsApp. Este asistente es una demo de esa tecnología.

TECNOLOGÍAS
Python, TypeScript, JavaScript, PHP, SQL, React, Next.js, Tailwind CSS, Vite, Supabase, PostgreSQL, MySQL, Firebase, Vercel, Docker, Git, fundamentos de AWS, APIs de LLMs, Squid CGX, OBS, CasparCG, Premiere Pro y After Effects.

DISPONIBILIDAD
Busca sumarse a un equipo de Argentina o LatAm, en remoto o presencial en Mar del Plata, y toma proyectos puntuales de desarrollo web, automatización y producción audiovisual. También hace soporte IT para hogares y comercios en Mar del Plata.

CONTACTO
Email: nicocoudouy@gmail.com · WhatsApp: +54 9 223 593-7732 · LinkedIn: linkedin.com/in/nicocoudouy · GitHub: github.com/nico-coudouy

PERSONAL
Entrena CrossFit y le gusta salir a la costa con sus perros.`;

const LANG_INSTRUCTION = {
  es: '',
  en: '\n\nIMPORTANT: The visitor is browsing the English version of the site. Answer in clear, natural English.',
};

/* ───────────── Rate limiting ───────────── */

type Lang = 'es' | 'en';
type Msg = { role: 'user' | 'assistant'; content: string };
type LimitResult = { ok: boolean; remaining: number };

// Upstash Redis from the Vercel Marketplace sets KV_* variables; a manual setup uses UPSTASH_*.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const visitorLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(LIMITS.perVisitorPerDay, '1 d'), prefix: 'chat:visitor' })
  : null;
const globalLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(LIMITS.globalPerDay, '1 d'), prefix: 'chat:global' })
  : null;

// Fallback while Upstash is not configured: counts per server instance and resets on cold starts.
// Good enough to stop casual abuse, not a guarantee. Configure Upstash for real limits.
const memory = new Map<string, { count: number; resetAt: number }>();
function memoryLimit(key: string, max: number): LimitResult {
  const now = Date.now();
  let entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + 86_400_000 };
    memory.set(key, entry);
  }
  if (entry.count >= max) return { ok: false, remaining: 0 };
  entry.count += 1;
  return { ok: true, remaining: max - entry.count };
}

async function checkLimits(ip: string): Promise<LimitResult & { scope: 'visitor' | 'global' }> {
  if (visitorLimiter && globalLimiter) {
    const visitor = await visitorLimiter.limit(ip);
    if (!visitor.success) return { ok: false, remaining: 0, scope: 'visitor' };
    const global = await globalLimiter.limit('site');
    if (!global.success) return { ok: false, remaining: visitor.remaining, scope: 'global' };
    return { ok: true, remaining: visitor.remaining, scope: 'visitor' };
  }
  const visitor = memoryLimit(`v:${ip}`, LIMITS.perVisitorPerDay);
  if (!visitor.ok) return { ...visitor, scope: 'visitor' };
  const global = memoryLimit('global', LIMITS.globalPerDay);
  if (!global.ok) return { ok: false, remaining: visitor.remaining, scope: 'global' };
  return { ...visitor, scope: 'visitor' };
}

/* ───────────── Helpers ───────────── */

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || (req.headers['x-real-ip'] as string) || 'unknown';
}

function allowedOrigins(): string[] {
  const list = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (host) list.push(`https://${host}`);
  }
  list.push(
    'https://www.nicolascoudouy.com.ar',
    'https://nicolascoudouy.com.ar',
    'https://mylandingpage-one.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  );
  return list;
}

function sanitize(body: unknown): Msg[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m): m is Msg => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1000) }))
    .filter((m) => m.content.length > 0)
    .slice(-LIMITS.maxHistory);
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}

async function complete(url: string, key: string, model: string, messages: Msg[], lang: Lang): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT + LANG_INSTRUCTION[lang] }, ...messages],
      max_tokens: LIMITS.maxTokens + (isReasoningModel(model) ? REASONING_TOKENS : 0),
      temperature: 0.4,
      ...(isReasoningModel(model) ? { reasoning_effort: 'low' } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${model} respondió ${res.status}: ${await res.text().catch(() => '')}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error(`${model} devolvió una respuesta vacía`);
  return text.trim();
}

/** Groq first; optional OpenAI-compatible fallback (Cerebras, Gemini, etc.) via FALLBACK_* variables. */
async function answer(messages: Msg[], lang: Lang): Promise<string> {
  const errors: unknown[] = [];
  if (process.env.GROQ_API_KEY) {
    try {
      return await complete(GROQ_URL, process.env.GROQ_API_KEY, GROQ_MODEL, messages, lang);
    } catch (e) {
      errors.push(e);
    }
  }
  const { FALLBACK_API_URL: url, FALLBACK_API_KEY: key, FALLBACK_MODEL: model } = process.env;
  if (url && key && model) {
    try {
      return await complete(url, key, model, messages, lang);
    } catch (e) {
      errors.push(e);
    }
  }
  throw new AggregateError(errors, 'Ningún proveedor respondió');
}

/* ───────────── Handler ───────────── */

const TEXT = {
  es: {
    method: 'Método no permitido.',
    origin: 'Este asistente solo responde desde el sitio de Nico.',
    invalid: 'No entendí la pregunta. ¿Podés escribirla de nuevo?',
    tooLong: `La pregunta es muy larga. Probá con menos de ${LIMITS.maxChars} caracteres.`,
    unavailable: 'El asistente no está disponible en este momento.',
    globalLimit: 'El asistente llegó a su límite de consultas por hoy.',
    visitorLimit: `Llegaste al límite de ${LIMITS.perVisitorPerDay} preguntas por hoy.`,
    failed: 'No pude responder ahora.',
    contact: 'Podés escribirle a Nico a nicocoudouy@gmail.com.',
  },
  en: {
    method: 'Method not allowed.',
    origin: "This assistant only answers from Nico's website.",
    invalid: "I didn't understand the question. Could you try again?",
    tooLong: `That question is too long. Please keep it under ${LIMITS.maxChars} characters.`,
    unavailable: 'The assistant is not available right now.',
    globalLimit: 'The assistant has reached its daily limit.',
    visitorLimit: `You've reached the limit of ${LIMITS.perVisitorPerDay} questions for today.`,
    failed: "I couldn't answer right now.",
    contact: 'You can email Nico at nicocoudouy@gmail.com.',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const lang: Lang = (req.body as { lang?: unknown })?.lang === 'en' ? 'en' : 'es';
  const t = TEXT[lang];

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ answer: t.method });
  }

  const origin = req.headers.origin;
  if (!origin || !allowedOrigins().includes(origin)) {
    return res.status(403).json({ answer: t.origin });
  }

  const messages = sanitize(req.body);
  if (!messages) {
    return res.status(400).json({ answer: t.invalid });
  }
  if (messages[messages.length - 1].content.length > LIMITS.maxChars) {
    return res.status(400).json({ answer: t.tooLong });
  }

  let limit;
  try {
    limit = await checkLimits(clientIp(req));
  } catch (e) {
    console.error('Error al consultar el límite de uso', e);
    return res.status(503).json({ answer: `${t.unavailable} ${t.contact}` });
  }
  if (!limit.ok) {
    const text = limit.scope === 'global' ? t.globalLimit : t.visitorLimit;
    return res.status(429).json({ answer: `${text} ${t.contact}`, remaining: 0 });
  }

  try {
    const text = await answer(messages, lang);
    return res.status(200).json({ answer: text, remaining: limit.remaining });
  } catch (e) {
    console.error('Error del proveedor de IA', e);
    return res.status(502).json({ answer: `${t.failed} ${t.contact}`, remaining: limit.remaining });
  }
}
