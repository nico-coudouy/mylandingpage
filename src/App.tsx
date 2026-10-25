import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Services from './components/Services';
import Assistant from './components/Assistant';
import About from './components/About';
import Contact from './components/Contact';
import { useCopy } from './i18n';

const COPY = {
  es: {
    credsLabel: 'Credenciales',
    creds: [
      ['9 años', 'en televisión en vivo, en Canal 8 Mar del Plata'],
      ['3', 'ediciones del Festival Internacional de Cine de Mar del Plata'],
      ['38', 'piezas de gráfica broadcast entregadas para un noticiero'],
      ['4–6 h', 'por semana que ahorra el escáner del archivo de video'],
    ],
    madeWith: 'HECHO CON REACT Y VERCEL',
  },
  en: {
    credsLabel: 'Credentials',
    creds: [
      ['9 years', 'in live television at Canal 8 Mar del Plata'],
      ['3', 'editions of the Mar del Plata International Film Festival'],
      ['38', 'broadcast graphics pieces delivered for a newscast'],
      ['4–6 h', 'saved every week by the video archive scanner'],
    ],
    madeWith: 'MADE WITH REACT AND VERCEL',
  },
};

export default function App() {
  const c = useCopy(COPY);
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <section className="creds" aria-label={c.credsLabel}>
          <div className="wrap">
            {c.creds.map(([n, t]) => (
              <div key={n} className="cred"><b>{n}</b><span>{t}</span></div>
            ))}
          </div>
        </section>
        <Projects />
        <Services />
        <Assistant />
        <About />
        <Contact />
      </main>
      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} NICO COUDOUY · MAR DEL PLATA</span>
          <span>{c.madeWith}</span>
        </div>
      </footer>
    </>
  );
}
