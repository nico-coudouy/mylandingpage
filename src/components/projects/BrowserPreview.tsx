import { useState } from 'react';
import { useCopy } from '../../i18n';

const COPY = {
  es: {
    label: 'Recorrer la web de Florencia Ferraro',
    hint: 'PASÁ EL MOUSE PARA RECORRER',
    altHome: 'Portada de la web de Florencia Ferraro Propiedades',
    altList: 'Catálogo de propiedades con filtros',
  },
  en: {
    label: 'Scroll through the Florencia Ferraro website',
    hint: 'HOVER TO SCROLL',
    altHome: 'Home page of the Florencia Ferraro Propiedades website',
    altList: 'Property catalog with filters',
  },
};

/** Browser frame that scrolls from the home page to the catalog on hover or tap. */
export default function BrowserPreview() {
  const c = useCopy(COPY);
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
        aria-label={c.label}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        }}
      >
        <div className="stack">
          <img src="/assets/ff-hero.jpg" alt={c.altHome} width={1258} height={859} />
          <img src="/assets/ff-props.jpg" alt={c.altList} width={1254} height={857} />
        </div>
        <span className="hint">{c.hint}</span>
      </div>
    </div>
  );
}
