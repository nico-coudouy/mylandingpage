import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Services from './components/Services';
import Assistant from './components/Assistant';
import About from './components/About';
import Contact from './components/Contact';

const CREDENTIALS = [
  ['9 años', 'en televisión en vivo, en Canal 8 Mar del Plata'],
  ['3', 'ediciones del Festival Internacional de Cine de Mar del Plata'],
  ['38', 'piezas de gráfica broadcast entregadas para un noticiero'],
  ['6 roles', 'en la operación al aire, de cámara a gráfica y soporte IT'],
];

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <section className="creds" aria-label="Credenciales">
          <div className="wrap">
            {CREDENTIALS.map(([n, t]) => (
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
          <span>HECHO CON REACT Y VERCEL</span>
        </div>
      </footer>
    </>
  );
}
