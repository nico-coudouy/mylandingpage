import { CodeIcon, VideoIcon } from './Icons';
import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Servicios',
    title: 'En qué te puedo ayudar.',
    services: [
      {
        title: 'Desarrollo web y automatización',
        text: 'Sitios y apps web con base de datos, integraciones entre sistemas y scripts que eliminan tareas repetitivas.',
        items: ['Webs para negocios y profesionales', 'Apps con usuarios, reservas o catálogos', 'Automatización con Python y APIs', 'Chatbots con IA para Instagram y WhatsApp'],
      },
      {
        title: 'Producción audiovisual y motion',
        text: 'Edición para redes, gráfica animada y piezas para televisión, con criterio de quien trabaja en el aire.',
        items: ['Edición de reels e historias', 'Motion graphics y animación', 'Gráfica broadcast para noticieros', 'Cámara y dirección de cámaras'],
      },
    ],
    also: 'También:',
    alsoText: 'soporte IT para hogares y comercios en Mar del Plata, con PC, notebooks y redes.',
    ask: 'CONSULTAR →',
  },
  en: {
    eyebrow: 'Services',
    title: 'How I can help.',
    services: [
      {
        title: 'Web development and automation',
        text: 'Websites and web apps with a database, integrations between systems, and scripts that remove repetitive work.',
        items: ['Websites for businesses and professionals', 'Apps with users, bookings or catalogs', 'Automation with Python and APIs', 'AI chatbots for Instagram and WhatsApp'],
      },
      {
        title: 'Video production and motion',
        text: 'Social media editing, animated graphics and TV pieces, with the judgment of someone who works on air.',
        items: ['Reels and stories editing', 'Motion graphics and animation', 'Broadcast graphics for newscasts', 'Camera operation and directing'],
      },
    ],
    also: 'Also:',
    alsoText: 'IT support for homes and small businesses in Mar del Plata: PCs, laptops and networks.',
    ask: 'ASK →',
  },
};

const ICONS = [<CodeIcon key="code" />, <VideoIcon key="video" />];

export default function Services() {
  const c = useCopy(COPY);
  return (
    <section className="sec" id="servicios" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
        </div>
        <div className="svc">
          {c.services.map((s, i) => (
            <div key={s.title} className="svc-card">
              <div className="ico">{ICONS[i]}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul>{s.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="svc-alt">
          <span><b>{c.also}</b> {c.alsoText}</span>
          <a href="#contacto">{c.ask}</a>
        </div>
      </div>
    </section>
  );
}
