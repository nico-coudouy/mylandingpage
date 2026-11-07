import type { Lang } from '../i18n';

type Text = Record<Lang, string>;

export type Tool = {
  /** URL segment: /herramientas/<slug>. The assistant uses it too (see api/_toolGuides.ts). */
  slug: string;
  /** Channel number shown on the card, like a multiview label. */
  ch: string;
  /** Short name for cards and the page heading. */
  name: Text;
  /** One line for the card. */
  short: Text;
  /** Tab title and search-result title. */
  title: Text;
  /** Meta description: what someone searching would want to read. */
  description: Text;
  /** True if the tool opens the visitor's files (shows the "runs on your device" note). */
  files: boolean;
  /** Questions offered in the assistant while this tool is open. */
  suggestions: Record<Lang, string[]>;
};

export const TOOLS: Tool[] = [
  {
    slug: 'unir-y-separar-pdf',
    files: true,
    ch: '01',
    name: { es: 'Unir y separar PDF', en: 'Merge and split PDF' },
    short: {
      es: 'Juntá varios PDF en uno o sacá las páginas que necesitás.',
      en: 'Combine several PDFs into one or pull out the pages you need.',
    },
    title: { es: 'Unir y separar PDF gratis, sin subir archivos · Nico Coudouy', en: 'Merge and split PDF for free, no uploads · Nico Coudouy' },
    description: {
      es: 'Uní varios PDF en uno, extraé páginas o separá cada página en un archivo. Todo se procesa en tu navegador: tus documentos no se suben a ningún servidor.',
      en: 'Merge PDFs, extract pages or split every page into its own file. Everything runs in your browser: your documents are never uploaded.',
    },
    suggestions: {
      es: ['¿Cómo cambio el orden de los PDF?', '¿Cómo saco solo algunas páginas?', '¿Mis archivos se suben a algún lado?'],
      en: ['How do I change the order of the PDFs?', 'How do I extract only some pages?', 'Are my files uploaded anywhere?'],
    },
  },
  {
    slug: 'fotos-a-pdf',
    files: true,
    ch: '02',
    name: { es: 'Fotos a PDF', en: 'Photos to PDF' },
    short: {
      es: 'JPG, PNG y fotos del iPhone (HEIC) en un solo PDF, listo para mandar.',
      en: 'JPG, PNG and iPhone photos (HEIC) in a single PDF, ready to send.',
    },
    title: { es: 'Fotos a PDF (JPG, PNG y HEIC del iPhone) sin subir archivos · Nico Coudouy', en: 'Photos to PDF (JPG, PNG and iPhone HEIC), no uploads · Nico Coudouy' },
    description: {
      es: 'Convertí fotos JPG, PNG y HEIC del iPhone en un PDF para trámites: DNI, recibos, comprobantes. Se procesa en tu navegador, nada se sube a internet.',
      en: 'Turn JPG, PNG and iPhone HEIC photos into one PDF for paperwork. It runs in your browser and nothing is uploaded.',
    },
    suggestions: {
      es: ['¿Puedo usar fotos del iPhone?', '¿Cómo hago que el PDF pese menos?', '¿Cómo pongo el frente y dorso del DNI en una hoja?'],
      en: ['Can I use iPhone photos?', 'How do I make the PDF smaller?', 'How do I put both sides of an ID on one page?'],
    },
  },
  {
    slug: 'qr-whatsapp',
    files: false,
    ch: '03',
    name: { es: 'QR y links de WhatsApp', en: 'QR codes and WhatsApp links' },
    short: {
      es: 'QR del wifi, de tu menú o de un WhatsApp con el mensaje ya escrito.',
      en: 'QR codes for your wifi, your menu or a WhatsApp chat with a ready-made message.',
    },
    title: { es: 'Generador de QR y links de WhatsApp gratis · Nico Coudouy', en: 'Free QR code and WhatsApp link generator · Nico Coudouy' },
    description: {
      es: 'Creá un QR para el wifi, la carta de tu local o una web, y links de WhatsApp con mensaje armado. Gratis, sin registro y sin vencimiento.',
      en: 'Create QR codes for wifi, a menu or a website, plus WhatsApp links with a pre-filled message. Free, no sign-up, never expires.',
    },
    suggestions: {
      es: ['¿El QR vence?', '¿Cómo hago un QR para el wifi?', '¿En qué tamaño lo imprimo?'],
      en: ['Does the QR code expire?', 'How do I make a wifi QR code?', 'What size should I print it?'],
    },
  },
  {
    slug: 'calculadora-video',
    files: false,
    ch: '04',
    name: { es: 'Calculadora de video', en: 'Video calculator' },
    short: {
      es: 'Timecode, cuadros por segundo y cuánto va a pesar un video según el bitrate.',
      en: 'Timecode, frame rates and how big a video will be for a given bitrate.',
    },
    title: { es: 'Calculadora de video: timecode, fps y peso por bitrate · Nico Coudouy', en: 'Video calculator: timecode, fps and file size by bitrate · Nico Coudouy' },
    description: {
      es: 'Convertí timecode a cuadros y segundos en 23.976, 25, 29.97 y 50 fps, y calculá el peso de un video o el bitrate que necesitás para un tamaño máximo.',
      en: 'Convert timecode to frames and seconds at 23.976, 25, 29.97 and 50 fps, and work out file size or the bitrate you need for a size limit.',
    },
    suggestions: {
      es: ['¿Qué bitrate uso para Instagram?', '¿Qué es el drop frame?', '¿Por qué mi video pesa más de lo calculado?'],
      en: ['What bitrate should I use for Instagram?', 'What is drop frame?', 'Why is my file bigger than calculated?'],
    },
  },
];

export const toolBySlug = (slug: string | undefined) => TOOLS.find((t) => t.slug === slug);

/** Slug of the tool open at this path, if any. */
export function toolFromPath(pathname: string): Tool | undefined {
  const m = pathname.match(/^\/herramientas\/([^/]+)\/?$/);
  return m ? toolBySlug(m[1]) : undefined;
}
