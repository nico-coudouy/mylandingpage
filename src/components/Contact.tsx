import { useState, type ReactNode } from 'react';
import { CONTACT, CV_URL } from '../data/profile';
import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Contacto',
    h2a: 'Hablemos de tu ',
    h2b: 'próximo proyecto.',
    lead: 'Busco sumarme a un equipo y también tomo proyectos puntuales. Respondo en menos de 24 horas.',
    cv: 'Descargar CV en PDF',
    copy: 'COPIAR', copied: 'COPIADO', failed: 'NO SE PUDO',
  },
  en: {
    eyebrow: 'Contact',
    h2a: "Let's talk about your ",
    h2b: 'next project.',
    lead: "I'm looking to join a team and I also take on freelance projects. I reply within 24 hours.",
    cv: 'Download CV (PDF, Spanish)',
    copy: 'COPY', copied: 'COPIED', failed: 'FAILED',
  },
};

type Labels = { copy: string; copied: string; failed: string };

function CopyButton({ value, labels }: { value: string; labels: Labels }) {
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('done');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 1600);
  };
  return (
    <button className={`copy${state === 'done' ? ' done' : ''}`} onClick={copy}>
      {state === 'done' ? labels.copied : state === 'error' ? labels.failed : labels.copy}
    </button>
  );
}

function Row({ k, children, copy, labels }: { k: string; children: ReactNode; copy?: string; labels: Labels }) {
  return (
    <div className="crow">
      <span className="k">{k}</span>
      <span className="v">{children}</span>
      {copy && <CopyButton value={copy} labels={labels} />}
    </div>
  );
}

export default function Contact() {
  const c = useCopy(COPY);
  return (
    <section className="sec contact" id="contacto">
      <div className="wrap">
        <span className="eyebrow">{c.eyebrow}</span>
        <h2>{c.h2a}<em>{c.h2b}</em></h2>
        <p className="lead">{c.lead}</p>
        <div className="clist">
          <Row k="EMAIL" copy={CONTACT.email} labels={c}><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></Row>
          <Row k="WHATSAPP" copy={CONTACT.whatsappNumber} labels={c}><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener">{CONTACT.whatsappDisplay}</a></Row>
          <Row k="LINKEDIN" labels={c}><a href={CONTACT.linkedin} target="_blank" rel="noopener">linkedin.com/in/nicocoudouy</a></Row>
          <Row k="GITHUB" labels={c}><a href={CONTACT.github} target="_blank" rel="noopener">github.com/nico-coudouy</a></Row>
        </div>
        <div className="ctas" style={{ marginTop: 28 }}>
          <a className="btn primary" href={CV_URL} target="_blank" rel="noopener">{c.cv}</a>
        </div>
      </div>
    </section>
  );
}
