import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useCopy, useLang, type Lang } from '../i18n';
import { ROUTES } from '../routes';

const COPY = {
  es: { cta: 'Escribime', nav: 'Páginas', lang: 'Idioma', menu: 'Abrir menú', closeMenu: 'Cerrar menú' },
  en: { cta: 'Contact me', nav: 'Pages', lang: 'Language', menu: 'Open menu', closeMenu: 'Close menu' },
};

const LANGS: Lang[] = ['es', 'en'];

export default function Nav() {
  const c = useCopy(COPY);
  const { lang, setLang } = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating or pressing Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav${open ? ' open' : ''}`}>
      <div className="wrap">
        <Link className="brand" to="/">
          <span className="mark">NC</span>Nico Coudouy
        </Link>
        <nav className="links" aria-label={c.nav}>
          <div className="pages" id="nav-pages">
            {ROUTES.map((r) => (
              <NavLink key={r.path} to={r.path} end className={({ isActive }) => (isActive ? 'on' : undefined)}>
                {r.label[lang]}
              </NavLink>
            ))}
          </div>
          <div className="lang" role="group" aria-label={c.lang}>
            {LANGS.map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a className="btn primary" href="#contacto" onClick={() => setOpen(false)}>{c.cta}</a>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="nav-pages" aria-label={open ? c.closeMenu : c.menu} onClick={() => setOpen(!open)}>
            <span aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
