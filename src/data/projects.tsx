import type { ReactNode } from 'react';
import type { Lang } from '../i18n';
import AutoVideo from '../components/AutoVideo';
import TeleochoMedia from '../components/projects/TeleochoMedia';
import BrowserPreview from '../components/projects/BrowserPreview';
import AutomationConsole from '../components/projects/AutomationConsole';
import AudiovisualMedia, { FestivalEditions } from '../components/projects/AudiovisualMedia';

export type Category = 'web' | 'auto' | 'broadcast' | 'av';

export const FILTERS: { id: Category | 'all'; label: Record<Lang, string> }[] = [
  { id: 'all', label: { es: 'Todos', en: 'All' } },
  { id: 'web', label: { es: 'Web', en: 'Web' } },
  { id: 'auto', label: { es: 'Automatización', en: 'Automation' } },
  { id: 'broadcast', label: { es: 'Broadcast', en: 'Broadcast' } },
  { id: 'av', label: { es: 'Audiovisual', en: 'Video' } },
];

type ProjectText = {
  eyebrow: string;
  title: string;
  summary: string;
  details: { label: string; text: string }[];
  badge?: string;
  link?: string;
};

export type Project = {
  id: string;
  /** Featured projects get a full-width row; the rest show as compact cards. */
  featured: boolean;
  categories: Category[];
  tags: string[];
  /** Full-size media for featured rows, or a 4:3 thumbnail for compact cards. */
  media: ReactNode;
  logo?: { src: string; alt: string };
  href?: string;
  /** Extra block for featured rows, shown under the summary. */
  extra?: ReactNode;
  text: Record<Lang, ProjectText>;
};

export const PROJECTS: Project[] = [
  {
    id: 'teleocho',
    featured: true,
    categories: ['broadcast', 'av'],
    tags: ['HTML Canvas', 'JavaScript', 'Playwright', 'FFmpeg'],
    media: <TeleochoMedia />,
    logo: { src: '/assets/canal8.png', alt: 'Canal 8' },
    text: {
      es: {
        eyebrow: 'Gráfica broadcast · Canal 8',
        title: 'Teleocho Informa',
        summary: 'Paquete gráfico animado completo para el noticiero de las 13, generado con código en lugar de un programa de motion.',
        details: [
          { label: 'Problema', text: 'El noticiero necesitaba una identidad nueva para las pantallas de estudio y el aire, en horizontal y vertical.' },
          { label: 'Solución', text: 'Un motor de animación en HTML y Canvas, con un renderizador por lotes que exporta cada pieza en 50p.' },
          { label: 'Resultado', text: '38 piezas entregadas: 6 fondos por sección en loops de 40 s, aperturas, separadores y placas.' },
        ],
      },
      en: {
        eyebrow: 'Broadcast graphics · Canal 8',
        title: 'Teleocho Informa',
        summary: 'A complete animated graphics package for the 1 p.m. newscast, generated with code instead of a motion graphics app.',
        details: [
          { label: 'Problem', text: 'The newscast needed a new identity for the studio screens and the on-air feed, in landscape and portrait.' },
          { label: 'Solution', text: 'An HTML and Canvas animation engine, with a batch renderer that exports every piece at 50p.' },
          { label: 'Result', text: '38 pieces delivered: 6 section backgrounds in 40-second loops, openers, bumpers and title cards.' },
        ],
      },
    },
  },
  {
    id: 'florencia-ferraro',
    featured: true,
    categories: ['web'],
    tags: ['Supabase', 'Vercel', 'UI design'],
    media: <BrowserPreview />,
    href: 'https://www.florenciaferraro.com.ar/',
    text: {
      es: {
        eyebrow: 'Web · Cliente real',
        title: 'Florencia Ferraro Propiedades',
        summary: 'Web completa para una inmobiliaria de Mar del Plata, del diseño a la puesta en producción.',
        details: [
          { label: 'Problema', text: 'La inmobiliaria necesitaba una web propia para mostrar su cartera y recibir consultas.' },
          { label: 'Solución', text: 'Catálogo con filtros por operación, tipo, ambientes y precio, conversión con dólar oficial y contacto directo por WhatsApp.' },
          { label: 'Resultado', text: 'En uso: la inmobiliaria carga sola entre 5 y 10 propiedades nuevas por mes.' },
        ],
        link: 'Ver sitio',
      },
      en: {
        eyebrow: 'Web · Real client',
        title: 'Florencia Ferraro Propiedades',
        summary: 'A complete website for a real estate agency in Mar del Plata, from design to production.',
        details: [
          { label: 'Problem', text: 'The agency needed its own website to show its listings and receive inquiries.' },
          { label: 'Solution', text: 'A catalog filtered by deal type, property type, rooms and price, with official USD exchange conversion and direct WhatsApp contact.' },
          { label: 'Result', text: 'In daily use: the agency adds 5 to 10 new properties a month on its own.' },
        ],
        link: 'Visit site',
      },
    },
  },
  {
    id: 'automatizaciones',
    featured: true,
    categories: ['auto', 'broadcast'],
    tags: ['Python', 'PyInstaller', 'Airtable API', 'Squid CGX'],
    media: <AutomationConsole />,
    text: {
      es: {
        eyebrow: 'Automatización · Canal 8',
        title: 'Herramientas para la operación del canal',
        summary: 'Soluciones chicas para tareas que se repiten todos los días en un canal de televisión.',
        details: [
          { label: 'Problema', text: 'Búsquedas manuales en el archivo de video y rundowns que se cargaban a mano en la gráfica antes de cada programa.' },
          { label: 'Solución', text: 'Scripts y apps a medida que conectan las herramientas que el canal ya usa.' },
          { label: 'Resultado', text: 'El escáner del archivo le ahorra al equipo entre 4 y 6 horas por semana.' },
        ],
      },
      en: {
        eyebrow: 'Automation · Canal 8',
        title: 'Tools for the station’s daily operation',
        summary: 'Small, focused tools for tasks that repeat every day at a TV station.',
        details: [
          { label: 'Problem', text: 'Manual searches through the video archive, and rundowns typed into the graphics system by hand before every show.' },
          { label: 'Solution', text: 'Custom scripts and apps that connect the tools the station already uses.' },
          { label: 'Result', text: 'The archive scanner saves the team 4 to 6 hours every week.' },
        ],
      },
    },
  },
  {
    id: 'audiovisual',
    featured: true,
    categories: ['av'],
    tags: ['Premiere Pro', 'After Effects', 'Motion graphics', 'Drone DJI'],
    media: <AudiovisualMedia />,
    extra: <FestivalEditions />,
    text: {
      es: {
        eyebrow: 'Edición audiovisual',
        title: 'Festival de Cine y video con drone',
        summary: 'Edición y animación de videos para las redes del Festival Internacional de Cine de Mar del Plata, y videos de propiedades para Florencia Ferraro Propiedades.',
        details: [
          { label: 'Festival', text: 'Reels de feed e historias de las actividades del festival, con gráfica animada, en tres ediciones seguidas.' },
          { label: 'Camet Norte', text: 'Video de un chalet para la inmobiliaria: tomas con drone, interiores y edición en formato vertical.' },
        ],
      },
      en: {
        eyebrow: 'Video editing',
        title: 'Film festival and drone video',
        summary: 'Video editing and animation for the Mar del Plata International Film Festival’s social media, plus property videos for Florencia Ferraro Propiedades.',
        details: [
          { label: 'Festival', text: 'Feed reels and stories covering the festival’s events, with animated graphics, three editions in a row.' },
          { label: 'Camet Norte', text: 'A house video for the real estate agency: drone footage, interiors and vertical editing.' },
        ],
      },
    },
  },
  {
    id: 'conversor',
    featured: false,
    categories: ['auto'],
    tags: ['Python', 'PySide6', 'FFmpeg', 'PyInstaller'],
    media: <img className="top" src="/assets/conversor.png" alt="Conversor Profesional" width={745} height={729} loading="lazy" />,
    href: 'https://github.com/nico-coudouy/conversor-profesional',
    text: {
      es: {
        eyebrow: 'Software · App de escritorio',
        title: 'Conversor Profesional',
        summary: 'App de escritorio para convertir videos en lote a MP4 con FFmpeg: arrastrás los archivos, elegís la calidad y listo.',
        details: [
          { label: 'Qué hace', text: 'Conversión en lote con 4 presets de calidad, progreso por archivo y total, cancelación y descarga desde links.' },
          { label: 'Cómo', text: 'Interfaz en PySide6 y conversión en un hilo aparte para que la app no se trabe. Se distribuye como .exe portable con FFmpeg incluido.' },
        ],
        link: 'Ver código',
      },
      en: {
        eyebrow: 'Software · Desktop app',
        title: 'Conversor Profesional',
        summary: 'A desktop app that batch-converts videos to MP4 with FFmpeg: drop the files, pick a quality preset, done.',
        details: [
          { label: 'Features', text: 'Batch conversion with 4 quality presets, per-file and overall progress, cancel, and download from links.' },
          { label: 'How', text: 'PySide6 interface with conversion on a separate thread so the app never freezes. Ships as a portable .exe with FFmpeg bundled.' },
        ],
        link: 'View code',
      },
    },
  },
  {
    id: 'tiza',
    featured: false,
    categories: ['web'],
    tags: ['Supabase', 'Vercel', 'GitHub'],
    media: <img src="/assets/tiza-thumb.jpg" alt="Tiza" width={1200} height={900} loading="lazy" />,
    text: {
      es: {
        eyebrow: 'Producto propio · Web app',
        badge: 'PILOTO',
        title: 'Tiza',
        summary: 'App web para reservar clases en distintos gimnasios. Cada gimnasio tiene su marca y sus alumnos reservan en dos toques.',
        details: [
          { label: 'Problema', text: 'El gimnasio piloto usaba una herramienta de turnos genérica y quería una propia, con su marca.' },
          { label: 'Solución', text: 'Plataforma para varios gimnasios, con clases con cupo, créditos con vencimiento y panel de administración.' },
          { label: 'Resultado', text: 'En piloto con un gimnasio de Mar del Plata.' },
        ],
      },
      en: {
        eyebrow: 'Own product · Web app',
        badge: 'PILOT',
        title: 'Tiza',
        summary: 'A web app to book classes at different gyms. Each gym keeps its own brand, and members book in two taps.',
        details: [
          { label: 'Problem', text: 'The pilot gym used a generic booking tool and wanted its own, under its brand.' },
          { label: 'Solution', text: 'A multi-gym platform with capped classes, expiring credits and an admin panel.' },
          { label: 'Result', text: 'Running as a pilot with a gym in Mar del Plata.' },
        ],
      },
    },
  },
  {
    id: 'liverundown',
    featured: false,
    categories: ['broadcast', 'web'],
    tags: ['React', 'Supabase Realtime', 'OSC', 'OBS WebSocket'],
    media: <img src="/assets/liverundown.jpg" alt="LiveRundown" width={1074} height={918} loading="lazy" />,
    text: {
      es: {
        eyebrow: 'Broadcast · Web app',
        badge: 'EN DESARROLLO',
        title: 'LiveRundown',
        summary: 'Proyecto en etapa de prototipo: un rundown de televisión en tiempo real, con una vista distinta para cada rol del programa.',
        details: [
          { label: 'La idea', text: 'En un programa en vivo, dirección, operación, producción y talento necesitan ver el mismo rundown actualizado al segundo.' },
          { label: 'En qué está', text: 'Base del proyecto armada: sincronización en tiempo real y primeras integraciones con OSC, OBS WebSocket y webhooks. La imagen es ilustrativa.' },
        ],
      },
      en: {
        eyebrow: 'Broadcast · Web app',
        badge: 'IN DEVELOPMENT',
        title: 'LiveRundown',
        summary: 'A prototype-stage project: a real-time TV rundown with a different view for each role on the show.',
        details: [
          { label: 'The idea', text: 'During a live show, the director, operators, producers and talent all need the same rundown, updated to the second.' },
          { label: 'Status', text: 'Project foundation in place: real-time sync and first integrations with OSC, OBS WebSocket and webhooks. The image is illustrative.' },
        ],
      },
    },
  },
];
