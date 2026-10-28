import { Link } from 'react-router';
import Hero from '../components/Hero';
import Reel from '../components/Reel';
import TizaDemo from '../components/projects/TizaDemo';
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
    with: 'Trabajo con y para',
    eyebrow: 'Proyectos',
    title: 'Trabajo real, en uso.',
    all: 'Ver todos los proyectos',
    ffTag: 'Web · Cliente real',
    ffText: 'Web completa para una inmobiliaria de Mar del Plata, con catálogo, filtros y contacto por WhatsApp. La inmobiliaria carga sola entre 5 y 10 propiedades nuevas por mes.',
    ffLink: 'Ver el caso completo',
    ffAlt: 'Portada de la web de Florencia Ferraro Propiedades',
    tizaTag: 'Producto propio · Piloto',
    tizaText: 'App web para reservar clases en distintos gimnasios. Cada gimnasio con su marca.',
    tizaAlt: 'Pantallas de la app Tiza',
    backTag: 'Detrás de cámara',
    backTitle: 'Del otro lado de la pantalla',
    backText: 'Nueve años en el control, las cámaras y la dirección de programas en vivo, en equipo.',
    backLink: 'Sobre mí',
    backAlt: 'Nico operando una grúa de cámara en el estudio',
  },
  en: {
    credsLabel: 'Credentials',
    creds: [
      ['9 years', 'in live television at Canal 8 Mar del Plata'],
      ['3', 'editions of the Mar del Plata International Film Festival'],
      ['38', 'broadcast graphics pieces delivered for a newscast'],
      ['4–6 h', 'saved every week by the video archive scanner'],
    ],
    with: 'Working with and for',
    eyebrow: 'Projects',
    title: 'Real work, in use.',
    all: 'See all projects',
    ffTag: 'Web · Real client',
    ffText: 'A full website for a Mar del Plata real estate agency, with a catalog, filters and WhatsApp contact. The agency adds 5 to 10 new listings a month on its own.',
    ffLink: 'See the full case',
    ffAlt: 'Home page of the Florencia Ferraro Propiedades website',
    tizaTag: 'Own product · Pilot',
    tizaText: 'A web app to book classes at different gyms, each with its own brand.',
    tizaAlt: 'Screens of the Tiza app',
    backTag: 'Behind the camera',
    backTitle: 'The other side of the screen',
    backText: 'Nine years in the control room, on cameras and directing live shows, as part of a team.',
    backLink: 'About me',
    backAlt: 'Nico operating a camera crane in the studio',
  },
};

const CLIENTS = ['Canal 8', 'Teleocho Informa', 'Festival de Cine de Mar del Plata', 'Florencia Ferraro Propiedades'];

export default function Home() {
  const c = useCopy(COPY);
  return (
    <>
      <Hero />
      <section className="creds" aria-label={c.credsLabel}>
        <div className="wrap">
          <div className="creds-grid">
            {c.creds.map(([n, t]) => (
              <div key={n} className="cred"><b>{n}</b><span>{t}</span></div>
            ))}
          </div>
          <div className="clients">
            <span>{c.with}</span>
            {CLIENTS.map((x) => <b key={x}>{x}</b>)}
          </div>
        </div>
      </section>
      <Reel />
      <section className="sec cream home-work">
        <div className="wrap">
          <div className="home-work-head">
            <div className="sec-head" style={{ margin: 0 }}>
              <span className="eyebrow">{c.eyebrow}</span>
              <h2>{c.title}</h2>
            </div>
            <Link className="btn ink" to="/proyectos">{c.all} <ArrowUpRight /></Link>
          </div>

          <article className="hw-feature">
            <div className="hw-shot"><img src="/assets/ff-hero.jpg" alt={c.ffAlt} width={1258} height={859} loading="lazy" /></div>
            <div className="hw-body">
              <span className="pill">{c.ffTag}</span>
              <h3>Florencia Ferraro Propiedades</h3>
              <p>{c.ffText}</p>
              <div className="hw-tags"><span>Supabase</span><span>Vercel</span><span>React</span></div>
              <Link className="hw-link" to="/proyectos">{c.ffLink} <ArrowUpRight size={14} /></Link>
            </div>
          </article>

          <div className="hw-pair">
            <article className="hw-card dark">
              <img src="/assets/tiza-thumb.jpg" alt={c.tizaAlt} width={1200} height={900} loading="lazy" />
              <div>
                <span className="kick">{c.tizaTag}</span>
                <h3>Tiza</h3>
                <p>{c.tizaText}</p>
                <TizaDemo />
              </div>
            </article>
            <article className="hw-card">
              <img className="bw" src="/assets/foto-grua.webp" alt={c.backAlt} width={900} height={1131} loading="lazy" />
              <div>
                <span className="kick">{c.backTag}</span>
                <h3>{c.backTitle}</h3>
                <p>{c.backText}</p>
                <Link className="hw-link" to="/sobre-mi">{c.backLink} <ArrowUpRight size={14} /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
