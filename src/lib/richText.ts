/**
 * Turns the assistant's plain-text answers into safe tokens: emails, web addresses
 * and phone numbers become links, and **bold** markers (which the model sometimes
 * adds anyway) become bold text instead of showing the asterisks.
 *
 * Links are only ever built from what the patterns below match, with an https://,
 * mailto: or wa.me prefix, so the model can never inject a javascript: URL.
 */

export type Token =
  | { type: 'text'; text: string; bold?: boolean }
  | { type: 'link'; text: string; href: string; external: boolean; bold?: boolean };

const EMOTICONS: Record<string, string> = {
  ':)': '🙂', ':-)': '🙂', ';)': '😉', ';-)': '😉', ':D': '😄', ':-D': '😄', ':P': '😛', ':p': '😛',
  ':(': '🙁', ':-(': '🙁', '<3': '❤️', '(y)': '👍', '(Y)': '👍', '(H)': '😎', '(h)': '😎',
};
const EMO_RE = /(^|\s)(:-?\)|;-?\)|:-?D|:[Pp]|:-?\(|<3|\([yYhH]\))(?=$|\s|[.,!?])/g;
export const emoticons = (s: string) => s.replace(EMO_RE, (_, pre: string, code: string) => pre + (EMOTICONS[code] ?? code));

const EMAIL = String.raw`[\w.+-]+@[\w-]+(?:\.[\w-]+)+`;
const URL = String.raw`https?:\/\/[^\s<>()]+`;
const DOMAIN = String.raw`(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|dev|app|ar)(?:\.[a-z]{2})?(?:\/[^\s<>()]*)?`;
const PHONE = String.raw`\+\d[\d\s-]{8,}\d`;
const LINK_RE = new RegExp(`(${EMAIL})|(${URL})|(${DOMAIN})|(${PHONE})`, 'gi');

/** Punctuation that ends a sentence is not part of the link. */
function trimTrail(s: string) {
  const m = s.match(/[.,;:!?'"]+$/);
  return m ? [s.slice(0, -m[0].length), m[0]] : [s, ''];
}

function linkify(text: string, bold: boolean, out: Token[]) {
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const [raw] = m;
    const start = m.index ?? 0;
    if (start > last) out.push({ type: 'text', text: text.slice(last, start), bold });
    const [core, trail] = trimTrail(raw);
    let href: string, external = true;
    if (m[1]) { href = `mailto:${core}`; external = false; }
    else if (m[4]) { href = `https://wa.me/${core.replace(/\D/g, '')}`; }
    else href = /^https?:\/\//i.test(core) ? core : `https://${core}`;
    out.push({ type: 'link', text: core, href, external, bold });
    if (trail) out.push({ type: 'text', text: trail, bold });
    last = start + raw.length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last), bold });
}

export function tokenize(input: string): Token[] {
  const out: Token[] = [];
  // Odd parts sit between ** markers.
  input.split(/\*\*(.+?)\*\*/g).forEach((part, i) => {
    if (part) linkify(emoticons(part), i % 2 === 1, out);
  });
  return out;
}
