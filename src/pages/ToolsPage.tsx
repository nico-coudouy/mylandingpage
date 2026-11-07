import { Link } from 'react-router';
import { useCopy, useLang } from '../i18n';
import { TOOLS } from '../tools/registry';
import { ArrowUpRight } from '../components/Icons';

const COPY = {
  es: {
    eyebrow: 'Herramientas',
    title: 'Herramientas que funcionan en tu navegador.',
    lead: 'Gratis, sin registro y sin subir tus archivos: todo se procesa en tu dispositivo. Las hice para resolver problemas de todos los días, desde un trámite hasta una edición.',
    open: 'ABRIR',
    local: 'SIN SUBIR ARCHIVOS',
  },
  en: {
    eyebrow: 'Tools',
    title: 'Tools that run in your browser.',
    lead: 'Free, no sign-up and no uploads: everything runs on your device. I built them to solve everyday problems, from paperwork to video editing.',
    open: 'OPEN',
    local: 'NO UPLOADS',
  },
};

/** Grid of tools drawn like a multiview: one channel per tool. */
export default function ToolsPage() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 className="page-h1">{c.title}</h1>
          <p className="lead">{c.lead}</p>
        </div>
        <ul className="tools-grid">
          {TOOLS.map((t) => (
            <li key={t.slug}>
              <Link className="tool-card" to={`/herramientas/${t.slug}`}>
                <span className="tool-card-top mono">
                  <span><i aria-hidden="true" />CH {t.ch}</span>
                  {t.files && <span>{c.local}</span>}
                </span>
                <h2>{t.name[lang]}</h2>
                <p>{t.short[lang]}</p>
                <span className="tool-card-open mono">{c.open} <ArrowUpRight /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
