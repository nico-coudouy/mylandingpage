import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useCopy, useLang } from '../../i18n';
import { openAssistant } from '../../lib/chat';
import { whatsappLink } from '../../lib/whatsapp';
import { CONTACT } from '../../data/profile';
import type { Tool } from '../../tools/registry';

const COPY = {
  es: {
    back: 'Herramientas',
    local: 'Se procesa en tu dispositivo',
    localNote: 'Tus archivos no se suben a ningún servidor.',
    help: '¿Necesitás ayuda?',
    customTitle: '¿Necesitás algo a medida?',
    customText: 'Si esta herramienta casi te sirve, o querés automatizar algo de tu negocio, escribime.',
    customCta: 'Escribime por WhatsApp',
    customMsg: (tool: string) => `Hola Nico, vi la herramienta "${tool}" en tu web y quería consultarte por algo a medida.`,
  },
  en: {
    back: 'Tools',
    local: 'Runs on your device',
    localNote: 'Your files are never uploaded to a server.',
    help: 'Need help?',
    customTitle: 'Need something custom?',
    customText: 'If this tool almost does the job, or you want to automate something in your business, get in touch.',
    customCta: 'Message me on WhatsApp',
    customMsg: (tool: string) => `Hi Nico, I saw the "${tool}" tool on your website and wanted to ask about something custom.`,
  },
};

/** Frame shared by every tool: heading, privacy note, help button and the "custom work" call to action. */
export default function ToolShell({ tool, local = true, children }: { tool: Tool; local?: boolean; children: ReactNode }) {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const digits = CONTACT.whatsappNumber.replace(/\D/g, '');
  return (
    <section className="sec tool-page">
      <div className="wrap">
        <div className="tool-head">
          <nav className="tool-crumb mono" aria-label="Breadcrumb">
            <Link to="/herramientas">{c.back}</Link>
            <span aria-hidden="true">/</span>
            <span>CH {tool.ch}</span>
          </nav>
          <h1>{tool.name[lang]}</h1>
          <p className="lead">{tool.short[lang]}</p>
          <div className="tool-meta">
            {local && (
              <span className="tool-local" title={c.localNote}>
                <i aria-hidden="true" />{c.local}<span className="sr-only">. {c.localNote}</span>
              </span>
            )}
            <button type="button" className="tool-help" onClick={openAssistant}>{c.help}</button>
          </div>
        </div>

        <div className="tool-body">{children}</div>

        <aside className="svc-alt tool-custom">
          <span><b>{c.customTitle}</b> {c.customText}</span>
          <a href={whatsappLink(digits, c.customMsg(tool.name[lang]))} target="_blank" rel="noopener">{c.customCta} →</a>
        </aside>
      </div>
    </section>
  );
}
