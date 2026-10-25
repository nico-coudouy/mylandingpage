import { useEffect, useState } from 'react';
import { useCopy, useLang, type Lang } from '../i18n';

const COPY = {
  es: {
    sections: [
      { id: 'proyectos', label: 'Proyectos' },
      { id: 'servicios', label: 'Servicios' },
      { id: 'sobre-mi', label: 'Sobre mí' },
    ],
    cta: 'Escribime',
    nav: 'Secciones',
    lang: 'Idioma',
  },
  en: {
    sections: [
      { id: 'proyectos', label: 'Projects' },
      { id: 'servicios', label: 'Services' },
      { id: 'sobre-mi', label: 'About' },
    ],
    cta: 'Contact me',
    nav: 'Sections',
    lang: 'Language',
  },
};

const LANGS: Lang[] = ['es', 'en'];

export default function Nav() {
  const c = useCopy(COPY);
  const { lang, setLang } = useLang();
  const [active, setActive] = useState<string | null>(null);

  // Highlight the link of the section crossing the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ['proyectos', 'servicios', 'asistente', 'sobre-mi', 'contacto'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav">
      <div className="wrap">
        <a className="brand" href="#inicio">
          <span className="mark">NC</span>Nico Coudouy
        </a>
        <nav className="links" aria-label={c.nav}>
          {c.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : undefined}>
              {s.label}
            </a>
          ))}
          <div className="lang" role="group" aria-label={c.lang}>
            {LANGS.map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a className="btn primary" href="#contacto">{c.cta}</a>
        </nav>
      </div>
    </header>
  );
}
