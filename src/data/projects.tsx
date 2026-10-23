import type { ReactNode } from 'react';
import AutoVideo from '../components/AutoVideo';
import TeleochoMedia from '../components/projects/TeleochoMedia';
import BrowserPreview from '../components/projects/BrowserPreview';
import AutomationConsole from '../components/projects/AutomationConsole';

export type Category = 'web' | 'auto' | 'broadcast' | 'av';

export const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'web', label: 'Web' },
  { id: 'auto', label: 'Automatización' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'av', label: 'Audiovisual' },
];

export type Project = {
  id: string;
  categories: Category[];
  eyebrow: string;
  title: string;
  summary: string;
  details: { label: string; text: string }[];
  tags: string[];
  media: ReactNode;
  logo?: { src: string; alt: string };
  badge?: string;
  link?: { href: string; label: string };
};

export const PROJECTS: Project[] = [
  {
    id: 'teleocho',
    categories: ['broadcast', 'av'],
    eyebrow: 'Gráfica broadcast · Canal 8',
    logo: { src: '/assets/canal8.png', alt: 'Canal 8' },
    title: 'Teleocho Informa',
    summary: 'Paquete gráfico animado completo para el noticiero de las 13, generado con código en lugar de un programa de motion.',
    details: [
      { label: 'Problema', text: 'El noticiero necesitaba una identidad nueva para las pantallas de estudio y el aire, en horizontal y vertical.' },
      { label: 'Solución', text: 'Un motor de animación en HTML y Canvas, con un renderizador por lotes que exporta cada pieza en 50p.' },
      { label: 'Resultado', text: '38 piezas entregadas: 6 fondos por sección en loops de 40 s, aperturas, separadores y placas.' },
    ],
    tags: ['HTML Canvas', 'JavaScript', 'Playwright', 'FFmpeg'],
    media: <TeleochoMedia />,
  },
  {
    id: 'florencia-ferraro',
    categories: ['web'],
    eyebrow: 'Web · Cliente real',
    title: 'Florencia Ferraro Propiedades',
    summary: 'Web completa para una inmobiliaria de Mar del Plata, del diseño a la puesta en producción.',
    details: [
      { label: 'Problema', text: 'La inmobiliaria necesitaba una web propia para mostrar su cartera y recibir consultas.' },
      { label: 'Solución', text: 'Catálogo con filtros por operación, tipo, ambientes y precio, conversión con dólar oficial y contacto directo por WhatsApp.' },
      { label: 'Resultado', text: 'Sitio publicado y en uso por la inmobiliaria.' },
    ],
    tags: ['Supabase', 'Vercel', 'Diseño UI'],
    media: <BrowserPreview />,
    link: { href: 'https://www.florenciaferraro.com.ar/', label: 'Ver sitio' },
  },
  {
    id: 'automatizaciones',
    categories: ['auto', 'broadcast'],
    eyebrow: 'Automatización · Canal 8',
    title: 'Herramientas para la operación del canal',
    summary: 'Soluciones chicas para tareas que se repiten todos los días en un canal de televisión.',
    details: [
      { label: 'Problema', text: 'Búsquedas manuales en el archivo de video y rundowns que se cargaban a mano en la gráfica antes de cada programa.' },
      { label: 'Solución', text: 'Scripts y apps a medida que conectan las herramientas que el canal ya usa.' },
      { label: 'Resultado', text: 'Herramientas en uso por los equipos de archivo, producción y aire.' },
    ],
    tags: ['Python', 'PyInstaller', 'Airtable API', 'Squid CGX'],
    media: <AutomationConsole />,
  },
  {
    id: 'tiza',
    categories: ['web'],
    eyebrow: 'Producto propio · Web app',
    badge: 'PILOTO',
    title: 'Tiza',
    summary: 'App web para reservar clases en distintos gimnasios. Cada gimnasio tiene su marca y sus alumnos reservan en dos toques.',
    details: [
      { label: 'Problema', text: 'El gimnasio piloto usaba una herramienta de turnos genérica y quería una propia, con su marca.' },
      { label: 'Solución', text: 'Plataforma para varios gimnasios, con clases con cupo, créditos con vencimiento y panel de administración.' },
      { label: 'Resultado', text: 'En piloto con un gimnasio de Mar del Plata.' },
    ],
    tags: ['Supabase', 'Vercel', 'GitHub'],
    media: (
      <div className="phones">
        <div className="phone"><img src="/assets/tiza-inicio.jpg" alt="Tiza, elección del gimnasio" width={470} height={1016} /></div>
        <div className="phone"><img src="/assets/tiza-reserva.jpg" alt="Tiza, clase reservada" width={470} height={1016} /></div>
      </div>
    ),
  },
  {
    id: 'festival',
    categories: ['av'],
    eyebrow: 'Edición audiovisual',
    title: 'Festival Internacional de Cine de Mar del Plata',
    summary: 'Edición y animación de videos para las redes del festival en tres ediciones seguidas.',
    details: [
      { label: 'Qué hago', text: 'Reels de feed e historias de las actividades del festival.' },
      { label: 'Formatos', text: 'Edición del video de feed y su adaptación a formato historia, con gráfica animada.' },
    ],
    tags: ['Premiere Pro', 'After Effects', 'Motion graphics'],
    media: (
      <div className="fest">
        <div className="phone">
          <AutoVideo src="/assets/festival.mp4" poster="/assets/festival.jpg" label="Fragmento de un reel del festival" />
        </div>
        <div className="eds" aria-label="Ediciones">
          <div className="ed"><b>2024</b><span>39° FESTIVAL</span></div>
          <div className="ed"><b>2025</b><span>40° FESTIVAL</span></div>
          <div className="ed now"><b>2026</b><span>41° FESTIVAL</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'liverundown',
    categories: ['broadcast', 'web'],
    eyebrow: 'Broadcast · Web app',
    badge: 'PROYECTO EN DESARROLLO',
    title: 'LiveRundown',
    summary: 'Proyecto en etapa de prototipo: un rundown de televisión en tiempo real, con una vista distinta para cada rol del programa.',
    details: [
      { label: 'La idea', text: 'En un programa en vivo, dirección, operación, producción y talento necesitan ver el mismo rundown actualizado al segundo.' },
      { label: 'En qué está', text: 'Base del proyecto armada: sincronización en tiempo real y primeras integraciones con OSC, OBS WebSocket y webhooks.' },
    ],
    tags: ['React', 'Supabase Realtime', 'OSC', 'OBS WebSocket'],
    media: (
      <div className="panel illus">
        <img src="/assets/liverundown.jpg" alt="Interfaz de referencia de LiveRundown" width={1074} height={918} />
        <span className="badge wip"><i />PROTOTIPO · VISTA ILUSTRATIVA</span>
      </div>
    ),
  },
];
