import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'sobre-mi', label: 'Sobre mí' },
];

export default function Nav() {
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
        <nav className="links" aria-label="Secciones">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : undefined}>
              {s.label}
            </a>
          ))}
          <a className="btn primary" href="#contacto">Escribime</a>
        </nav>
      </div>
    </header>
  );
}
