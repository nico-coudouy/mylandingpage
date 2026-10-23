import { useState } from 'react';

/** Browser frame that scrolls from the home page to the catalog on hover or tap. */
export default function BrowserPreview() {
  const [scrolled, setScrolled] = useState(false);
  const toggle = () => setScrolled((s) => !s);

  return (
    <div className="panel browser">
      <div className="bar">
        <i /><i /><i />
        <div className="url"><b>●</b>florenciaferraro.com.ar</div>
      </div>
      <div
        className={`vp${scrolled ? ' scrolled' : ''}`}
        tabIndex={0}
        role="button"
        aria-label="Recorrer la web de Florencia Ferraro"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        }}
      >
        <div className="stack">
          <img src="/assets/ff-hero.jpg" alt="Portada de la web de Florencia Ferraro Propiedades" width={1258} height={859} />
          <img src="/assets/ff-props.jpg" alt="Catálogo de propiedades con filtros" width={1254} height={857} />
        </div>
        <span className="hint">PASÁ EL MOUSE PARA RECORRER</span>
      </div>
    </div>
  );
}
