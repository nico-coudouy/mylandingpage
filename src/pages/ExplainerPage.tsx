import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import { useCopy, useLang } from '../i18n';
import { explainerBySlug } from '../explainers/registry';
import { openAssistant } from '../lib/chat';
import { whatsappLink } from '../lib/whatsapp';
import { CONTACT } from '../data/profile';
import NotFound from './NotFound';

// Each explainer loads only when someone opens it.
const COMPONENTS: Record<string, ReturnType<typeof lazy>> = {
  'hace-tu-zocalo': lazy(() => import('../explainers/ZocaloExplainer')),
};

const COPY = {
  es: {
    back: 'Recursos',
    section: 'Explicado simple',
    help: 'Preguntale al asistente',
    customTitle: '¿Tenés una tarea que se repite todos los días?',
    customText: 'Así como automaticé los zócalos del canal, puedo automatizar algo de tu trabajo.',
    customCta: 'Escribime por WhatsApp',
    customMsg: (name: string) => `Hola Nico, vi "${name}" en tu web y quería consultarte por algo.`,
  },
  en: {
    back: 'Resources',
    section: 'Explained simply',
    help: 'Ask the assistant',
    customTitle: 'Do you have a task you repeat every day?',
    customText: 'Just like I automated the channel’s lower thirds, I can automate part of your work.',
    customCta: 'Message me on WhatsApp',
    customMsg: (name: string) => `Hi Nico, I saw "${name}" on your website and wanted to ask you something.`,
  },
};

/** Frame shared by every explainer: heading with the plain question, the interactive piece and the call to action. */
export default function ExplainerPage() {
  const { slug } = useParams();
  const c = useCopy(COPY);
  const { lang } = useLang();
  const ex = explainerBySlug(slug);
  const Component = slug ? COMPONENTS[slug] : undefined;
  if (!ex || !Component) return <NotFound />;
  const digits = CONTACT.whatsappNumber.replace(/\D/g, '');
  return (
    <section className="sec tool-page ex-page">
      <div className="wrap">
        <div className="tool-head">
          <nav className="tool-crumb mono" aria-label="Breadcrumb">
            <Link to="/recursos#explicado">{c.back}</Link>
            <span aria-hidden="true">/</span>
            <span>{c.section}</span>
          </nav>
          <h1>{ex.name[lang]}</h1>
          <p className="lead">{ex.question[lang]}</p>
          <div className="tool-meta">
            <span className="ex-kicker mono">{ex.kicker[lang]}</span>
            <button type="button" className="tool-help" onClick={openAssistant}>{c.help}</button>
          </div>
        </div>

        <Suspense fallback={<div className="tool-loading" aria-busy="true" />}>
          <Component />
        </Suspense>

        <aside className="svc-alt tool-custom">
          <span><b>{c.customTitle}</b> {c.customText}</span>
          <a href={whatsappLink(digits, c.customMsg(ex.name[lang]))} target="_blank" rel="noopener">{c.customCta} →</a>
        </aside>
      </div>
    </section>
  );
}
