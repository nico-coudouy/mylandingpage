import type { Lang } from './i18n';

/** Pages of the site, with the title and description used in the tab and when a link is shared. */
export const ROUTES = [
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
    path: '/sobre-mi',
    label: { es: 'Sobre mí', en: 'About' },
    title: { es: 'Sobre mí · Nico Coudouy', en: 'About · Nico Coudouy' },
    description: {
      es: 'Técnico en informática con 9 años en Canal 8 Mar del Plata: de la cámara al código, y el equipo con el que trabajo todos los días.',
      en: 'IT technician with 9 years at Canal 8 Mar del Plata: from the camera to the code, and the team I work with every day.',
    },
  },
] as const satisfies readonly { path: string; label: Record<Lang, string>; title: Record<Lang, string>; description: Record<Lang, string> }[];

/** Old one-page anchors and where they live now. */
export const LEGACY_HASHES: Record<string, string> = {
  '#proyectos': '/proyectos',
  '#servicios': '/servicios',
  '#sobre-mi': '/sobre-mi',
  '#equipo': '/sobre-mi',
};
