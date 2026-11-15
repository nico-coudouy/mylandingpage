import type { Lang } from '../i18n';

type Text = Record<Lang, string>;

/** "Explicado simple": interactive pieces that explain what Nico does in plain words. */
export type Explainer = {
  /** URL segment: /explicado/<slug>. The assistant uses it too (see api/_topicGuides.ts). */
  slug: string;
  /** Kicker on the card and the page: which world it belongs to. */
  kicker: Text;
  /** Short name for cards and the page heading. */
  name: Text;
  /** The plain question it answers. */
  question: Text;
  /** One line for the card. */
  short: Text;
  /** Tab title and search-result title. */
  title: Text;
  /** Meta description. */
  description: Text;
  /** Image used when the page is shared (WhatsApp, Instagram, LinkedIn). */
  image: string;
  /** Questions offered in the assistant while this page is open. */
  suggestions: Record<Lang, string[]>;
};

export const EXPLAINERS: Explainer[] = [
  {
    slug: 'hace-tu-zocalo',
    kicker: { es: 'TV + código', en: 'TV + code' },
    name: { es: 'Hacé tu propio zócalo', en: 'Make your own lower third' },
    question: { es: '¿Cómo llega un texto a la pantalla de un noticiero?', en: 'How does a caption get onto a newscast screen?' },
    short: {
      es: 'Escribí tu zócalo, seguí su recorrido hasta la gráfica del canal y sacalo al aire vos.',
      en: 'Write your lower third, follow it all the way to the graphics system and put it on air yourself.',
    },
    title: { es: '¿Cómo llega un zócalo a la tele? Hacé el tuyo · Nico Coudouy', en: 'How does a lower third get on TV? Make yours · Nico Coudouy' },
    description: {
      es: 'Escribí tu nombre o un título, mirá cómo viaja hasta la gráfica de un canal de TV y sacalo al aire. Después descargalo para tu historia.',
      en: 'Type your name or a headline, watch it travel to a TV channel’s graphics system and put it on air. Then download it for your story.',
    },
    image: '/assets/og-zocalo.png',
    suggestions: {
      es: ['¿Qué es un zócalo?', '¿Por qué máximo 47 caracteres?', '¿Quién decide cuándo sale al aire?'],
      en: ['What is a lower third?', 'Why 47 characters max?', 'Who decides when it goes on air?'],
    },
  },
];

export const explainerBySlug = (slug: string | undefined) => EXPLAINERS.find((e) => e.slug === slug);

/** Explainer open at this path, if any. */
export function explainerFromPath(pathname: string): Explainer | undefined {
  const m = pathname.match(/^\/explicado\/([^/]+)\/?$/);
  return m ? explainerBySlug(m[1]) : undefined;
}
