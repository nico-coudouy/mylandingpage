import { Link } from 'react-router';
import { useCopy } from '../i18n';
import { ArrowUpRight } from '../components/Icons';

const COPY = {
  es: {
    label: 'Página no encontrada',
    title: 'Sin señal',
    text: 'Error 404 · Esta página no salió al aire.',
    home: 'Volver al aire',
    projects: 'Ver proyectos',
  },
  en: {
    label: 'Page not found',
    title: 'No signal',
    text: "Error 404 · This page never went on air.",
    home: 'Back on air',
    projects: 'See projects',
  },
};

/** 404 page drawn as SMPTE color bars, like a channel with no signal. */
export default function NotFound() {
  const c = useCopy(COPY);
  return (
    <section className="nosignal" aria-label={c.label}>
      <div className="bars" aria-hidden="true">
        <div className="bars-top" />
        <div className="bars-mid" />
        <div className="bars-low" />
      </div>
      <span className="ns-bug" aria-hidden="true">NC</span>
      <span className="ns-tc" aria-hidden="true">00:00:00:00</span>
      <div className="ns-box">
        <h1>{c.title}</h1>
        <p>{c.text}</p>
        <div className="ns-ctas">
          <Link className="btn primary" to="/">{c.home}</Link>
          <Link className="btn" to="/proyectos">{c.projects} <ArrowUpRight /></Link>
        </div>
      </div>
    </section>
  );
}
