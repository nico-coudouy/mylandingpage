import type { Lang } from './i18n';
import { TOOLS } from './tools/registry';
import { EXPLAINERS } from './explainers/registry';

export type Route = {
  path: string;
  label: Record<Lang, string>;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  /** False for pages that exist but are not linked from the main menu. */
  nav?: boolean;
  /** Image shown when the page is shared; defaults to the site's og-image. */
  image?: string;
};

/** Pages of the site, with the title and description used in the tab and when a link is shared. */
export const ROUTES: readonly Route[] = [
  {
    path: '/',
    label: { es: 'Inicio', en: 'Home' },
    title: { es: 'Nico Coudouy · Desarrollo web y automatización', en: 'Nico Coudouy · Web development and automation' },
    description: {
      es: 'Convierto procesos manuales en software que funciona. Desarrollo web y automatización, con 9 años de experiencia en televisión en vivo. Mar del Plata, remoto para Argentina y LatAm.',
      en: 'I turn manual processes into software that works. Web development and automation, backed by 9 years of live TV. Mar del Plata, Argentina, remote.',
    },
  },
  {
    path: '/proyectos',
    label: { es: 'Proyectos', en: 'Projects' },
    title: { es: 'Proyectos · Nico Coudouy', en: 'Projects · Nico Coudouy' },
    description: {
      es: 'Webs para clientes, automatizaciones para Canal 8, gráfica broadcast y edición audiovisual: problema, solución, resultado y stack de cada proyecto.',
      en: 'Client websites, automation for Canal 8, broadcast graphics and video editing: the problem, solution, result and stack of each project.',
    },
  },
  {
    path: '/servicios',
    label: { es: 'Servicios', en: 'Services' },
    title: { es: 'Servicios · Nico Coudouy', en: 'Services · Nico Coudouy' },
    description: {
      es: 'Desarrollo web, automatización, producción audiovisual, eventos y streaming en vivo en Mar del Plata y de forma remota.',
      en: 'Web development, automation, video production, live events and streaming in Mar del Plata and remotely.',
    },
  },
  {
    path: '/recursos',
    label: { es: 'Recursos', en: 'Resources' },
    title: { es: 'Recursos gratis: explicaciones simples y herramientas · Nico Coudouy', en: 'Free resources: plain explanations and tools · Nico Coudouy' },
    description: {
      es: 'Explicaciones interactivas de televisión y código para entender lo que hago, y herramientas gratis que funcionan en tu navegador: PDF, fotos a PDF y QR.',
      en: 'Interactive explanations of TV and code in plain words, plus free tools that run in your browser: PDFs, photos to PDF and QR codes.',
    },
  },
  {
    path: '/sobre-mi',
    label: { es: 'Sobre mí', en: 'About' },
    title: { es: 'Sobre mí · Nico Coudouy', en: 'About · Nico Coudouy' },
    description: {
      es: 'Técnico en informática con 9 años en Canal 8 Mar del Plata: de la cámara al código, y el equipo con el que trabajo todos los días.',
      en: 'IT technician with 9 years at Canal 8 Mar del Plata: from the camera to the code, and the team I work with every day.',
    },
  },
  ...EXPLAINERS.map((e) => ({
    path: `/explicado/${e.slug}`,
    label: e.name,
    title: e.title,
    description: e.description,
    image: e.image,
    nav: false,
  })),
  ...TOOLS.map((t) => ({
    path: `/herramientas/${t.slug}`,
    label: t.name,
    title: t.title,
    description: t.description,
    nav: false,
  })),
];

/** Old one-page anchors and where they live now. */
export const LEGACY_HASHES: Record<string, string> = {
  '#proyectos': '/proyectos',
  '#servicios': '/servicios',
  '#sobre-mi': '/sobre-mi',
  '#equipo': '/sobre-mi',
};
