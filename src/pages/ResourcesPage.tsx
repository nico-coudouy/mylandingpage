import { Link } from 'react-router';
import { useCopy, useLang } from '../i18n';
import { TOOLS } from '../tools/registry';
import { EXPLAINERS } from '../explainers/registry';
import { ArrowUpRight } from '../components/Icons';

const COPY = {
  es: {
    eyebrow: 'Recursos',
    title: 'Para entender y para resolver.',
    lead: 'Explicaciones interactivas de lo que hago en la tele y en el código, contadas para cualquiera, y herramientas gratis que funcionan en tu navegador.',
    learnEyebrow: 'Explicado simple',
    learnTitle: 'Tocá, probá y entendé cómo funciona.',
    toolsEyebrow: 'Herramientas',
    toolsTitle: 'Gratis, sin registro y sin subir tus archivos.',
    try: 'PROBAR',
    open: 'ABRIR',
    local: 'SIN SUBIR ARCHIVOS',
  },
  en: {
    eyebrow: 'Resources',
    title: 'To understand and to get things done.',
    lead: 'Interactive explanations of my work in TV and code, for anyone, plus free tools that run in your browser.',
    learnEyebrow: 'Explained simply',
    learnTitle: 'Touch it, try it and see how it works.',
    toolsEyebrow: 'Tools',
    toolsTitle: 'Free, no sign-up and no uploads.',
    try: 'TRY IT',
    open: 'OPEN',
    local: 'NO UPLOADS',
  },
};

/** Resources: interactive explanations first, then the tools drawn like a multiview. */
export default function ResourcesPage() {
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

        <div className="res-block" id="explicado">
          <div className="res-head">
            <span className="eyebrow">{c.learnEyebrow}</span>
            <h2>{c.learnTitle}</h2>
          </div>
          <ul className="learn-grid">
            {EXPLAINERS.map((e) => (
              <li key={e.slug}>
                <Link className="learn-card" to={`/explicado/${e.slug}`}>
                  <span className="learn-art" aria-hidden="true">
                    <span className="learn-tally">AL AIRE</span>
                    <span className="learn-z"><b>{e.name[lang]}</b><i>{e.kicker[lang]}</i></span>
                  </span>
                  <span className="learn-body">
                    <span className="tool-card-top mono"><span><i aria-hidden="true" />{e.kicker[lang]}</span></span>
                    <span className="learn-q">{e.question[lang]}</span>
                    <span className="learn-short">{e.short[lang]}</span>
                    <span className="tool-card-open mono">{c.try} <ArrowUpRight /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="res-block" id="herramientas">
          <div className="res-head">
            <span className="eyebrow">{c.toolsEyebrow}</span>
            <h2>{c.toolsTitle}</h2>
          </div>
          <ul className="tools-grid">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link className="tool-card" to={`/herramientas/${t.slug}`}>
                  <span className="tool-card-top mono">
                    <span><i aria-hidden="true" />CH {t.ch}</span>
                    {t.files && <span>{c.local}</span>}
                  </span>
                  <h3>{t.name[lang]}</h3>
                  <p>{t.short[lang]}</p>
                  <span className="tool-card-open mono">{c.open} <ArrowUpRight /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
