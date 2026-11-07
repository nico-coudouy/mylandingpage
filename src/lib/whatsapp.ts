/**
 * Turns a phone number the way people write it in Argentina ("0223 15 593-7732",
 * "+54 9 223 5937732", "223 5937732") into the digits wa.me expects: 549 + area code
 * + number, without the 0 and without the 15.
 * Numbers from other countries are accepted with their + prefix and left as they are.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  let d = trimmed.replace(/\D/g, '');
  if (d.startsWith('00')) {
    d = d.slice(2);
  } else if (trimmed.startsWith('+') && !d.startsWith('54')) {
    return d.length >= 8 && d.length <= 15 ? d : null; // another country: trust the person
  }

  if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('9') && d.length === 11) d = d.slice(1);
  if (d.startsWith('0')) d = d.slice(1);

  // Area code (2 to 4 digits) followed by 15: drop the 15. A national number has 10 digits.
  if (d.length === 12) {
    for (const area of [2, 3, 4]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `549${d}` : null;
}

/** wa.me link that opens a chat with the message already written. */
export function whatsappLink(phoneDigits: string, message = ''): string {
  const text = message.trim();
  return `https://wa.me/${phoneDigits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
