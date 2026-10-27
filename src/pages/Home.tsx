import { Link } from 'react-router';
import Hero from '../components/Hero';
import Reel from '../components/Reel';
import { useCopy } from '../i18n';
import { ArrowUpRight } from '../components/Icons';

const COPY = {
  es: {
    credsLabel: 'Credenciales',
    creds: [
      ['9 años', 'en televisión en vivo, en Canal 8 Mar del Plata'],
      ['3', 'ediciones del Festival Internacional de Cine de Mar del Plata'],
      ['38', 'piezas de gráfica broadcast entregadas para un noticiero'],
      ['4–6 h', 'por semana que ahorra el escáner del archivo de video'],
    ],
    moreEyebrow: 'Seguí recorriendo',
    moreTitle: '¿Querés ver más?',
    cards: [
      { to: '/proyectos', k: 'Proyectos', t: 'Trabajo real, en uso', d: 'Webs para clientes, automatizaciones para el canal, gráfica broadcast y edición. Con una demo de Tiza para probar.' },
      { to: '/servicios', k: 'Servicios', t: 'En qué te puedo ayudar', d: 'Desarrollo web, automatización, producción audiovisual, eventos y streaming en vivo.' },
      { to: '/sobre-mi', k: 'Sobre mí', t: 'De la cámara al código', d: 'Mi recorrido, lo que uso todos los días y el equipo con el que salimos al aire.' },
    ],
  },
  en: {
    credsLabel: 'Credentials',
    creds: [
      ['9 years', 'in live television at Canal 8 Mar del Plata'],
      ['3', 'editions of the Mar del Plata International Film Festival'],
      ['38', 'broadcast graphics pieces delivered for a newscast'],
      ['4–6 h', 'saved every week by the video archive scanner'],
    ],
    moreEyebrow: 'Keep exploring',
    moreTitle: 'Want to see more?',
    cards: [
      { to: '/proyectos', k: 'Projects', t: 'Real work, in use', d: 'Client websites, automation for the station, broadcast graphics and editing. Includes a Tiza demo you can try.' },
      { to: '/servicios', k: 'Services', t: 'How I can help', d: 'Web development, automation, video production, live events and streaming.' },
      { to: '/sobre-mi', k: 'About', t: 'From the camera to the code', d: 'My path, the tools I use every day and the team I go on air with.' },
    ],
  },
};

export default function Home() {
  const c = useCopy(COPY);
  return (
    <>
      <Hero />
      <section className="creds" aria-label={c.credsLabel}>
        <div className="wrap">
          {c.creds.map(([n, t]) => (
            <div key={n} className="cred"><b>{n}</b><span>{t}</span></div>
          ))}
        </div>
      </section>
      <Reel />
      <section className="sec next" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.moreEyebrow}</span>
            <h2>{c.moreTitle}</h2>
          </div>
          <div className="next-grid">
            {c.cards.map((x) => (
              <Link key={x.to} to={x.to} className="next-card">
                <span className="eyebrow">{x.k}</span>
                <b>{x.t}</b>
                <span>{x.d}</span>
                <i aria-hidden="true"><ArrowUpRight size={18} /></i>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
