import { useState, type ReactNode } from 'react';
import { CONTACT, CV_URL } from '../data/profile';

function CopyButton({ value }: { value: string }) {
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
      {state === 'done' ? 'COPIADO' : state === 'error' ? 'NO SE PUDO' : 'COPIAR'}
    </button>
  );
}

function Row({ k, children, copy }: { k: string; children: ReactNode; copy?: string }) {
  return (
    <div className="crow">
      <span className="k">{k}</span>
      <span className="v">{children}</span>
      {copy && <CopyButton value={copy} />}
    </div>
  );
}

export default function Contact() {
  return (
    <section className="sec contact" id="contacto">
      <div className="wrap">
        <span className="eyebrow">Contacto</span>
        <h2>Hablemos de tu <em>próximo proyecto.</em></h2>
        <p className="lead">Busco sumarme a un equipo y también tomo proyectos puntuales. Respondo en menos de 24 horas.</p>
        <div className="clist">
          <Row k="EMAIL" copy={CONTACT.email}><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></Row>
          <Row k="WHATSAPP" copy={CONTACT.whatsappNumber}><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener">{CONTACT.whatsappDisplay}</a></Row>
          <Row k="LINKEDIN"><a href={CONTACT.linkedin} target="_blank" rel="noopener">linkedin.com/in/nicocoudouy</a></Row>
          <Row k="GITHUB"><a href={CONTACT.github} target="_blank" rel="noopener">github.com/nico-coudouy</a></Row>
        </div>
        <div className="ctas" style={{ marginTop: 28 }}>
          <a className="btn primary" href={CV_URL} target="_blank" rel="noopener">Descargar CV en PDF</a>
        </div>
      </div>
    </section>
  );
}
