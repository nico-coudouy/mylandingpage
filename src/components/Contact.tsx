import { useState } from 'react';
import { CONTACT, CV_URL } from '../data/profile';
import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Contacto',
    h2a: 'Hablemos de tu ',
    h2b: 'próximo proyecto',
    lead: 'Busco sumarme a un equipo y también tomo proyectos puntuales. Respondo en menos de 24 horas.',
    cv: 'Descargar CV en PDF',
    copy: 'COPIAR EMAIL', copied: 'COPIADO', failed: 'NO SE PUDO',
  },
  en: {
    eyebrow: 'Contact',
    h2a: "Let's talk about your ",
    h2b: 'next project',
    lead: "I'm looking to join a team and I also take on freelance projects. I reply within 24 hours.",
    cv: 'Download CV (PDF, Spanish)',
    copy: 'COPY EMAIL', copied: 'COPIED', failed: 'FAILED',
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

export default function Contact() {
  const c = useCopy(COPY);
  return (
    <section className="sec contact" id="contacto">
      <div className="wrap">
        <span className="eyebrow">{c.eyebrow}</span>
        <h2>{c.h2a}<em>{c.h2b}</em></h2>
        <p className="lead">{c.lead}</p>
        <div className="contact-main">
          <a className="btn primary big" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <CopyButton value={CONTACT.email} labels={c} />
        </div>
        <div className="contact-links">
          <a className="btn" href={CONTACT.whatsappUrl} target="_blank" rel="noopener">WhatsApp · {CONTACT.whatsappDisplay}</a>
          <a className="btn" href={CONTACT.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a className="btn" href={CONTACT.github} target="_blank" rel="noopener">GitHub</a>
          <a className="btn" href={CV_URL} target="_blank" rel="noopener">{c.cv}</a>
        </div>
      </div>
    </section>
  );
}
