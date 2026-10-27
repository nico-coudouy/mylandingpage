import { useState } from 'react';
import { FILTERS, PROJECTS, type Category, type Project } from '../data/projects';
import { useCopy, useLang } from '../i18n';
import { ArrowUpRight } from './Icons';

const COPY = {
  es: { eyebrow: 'Proyectos', title: 'Trabajo real, en uso todos los días.', filter: 'Filtrar proyectos', more: 'Más proyectos', details: 'Ver detalle' },
  en: { eyebrow: 'Projects', title: 'Real work, used every day.', filter: 'Filter projects', more: 'More projects', details: 'Details' },
};

function Details({ items }: { items: { label: string; text: string }[] }) {
  return (
    <dl className="psr">
      {items.map((d) => (
        <div key={d.label}><dt>{d.label}</dt><dd>{d.text}</dd></div>
      ))}
    </dl>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return <div className="tags">{tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>;
}

function FeaturedCase({ p }: { p: Project }) {
  const t = p.text[useLang().lang];
  return (
    <article className="case">
      <div className="media">{p.media}</div>
      <div>
        <div className="kicker">
          {p.logo && <img src={p.logo.src} alt={p.logo.alt} width={24} height={30} />}
          <span className="eyebrow">{t.eyebrow}</span>
          {t.badge && <span className="badge wip"><i />{t.badge}</span>}
        </div>
        <h3>{t.title}</h3>
        <p className="sum">{t.summary}</p>
        {p.extra}
        <Details items={t.details} />
        <Tags tags={p.tags} />
        {p.href && t.link && (
          <div className="plinks">
            <a className="btn" href={p.href} target="_blank" rel="noopener">{t.link} <ArrowUpRight /></a>
          </div>
        )}
      </div>
    </article>
  );
}

function CompactCase({ p, detailsLabel }: { p: Project; detailsLabel: string }) {
  const t = p.text[useLang().lang];
  return (
    <article className="mini-case">
      <div className="mini-media">{p.media}</div>
      <div className="mini-body">
        <div className="kicker">
          <span className="eyebrow">{t.eyebrow}</span>
          {t.badge && <span className="badge wip"><i />{t.badge}</span>}
        </div>
        <h3>{t.title}</h3>
        <p className="sum">{t.summary}</p>
        <details>
          <summary>{detailsLabel}</summary>
          <Details items={t.details} />
        </details>
        <Tags tags={p.tags} />
        {p.action}
        {p.href && t.link && (
          <a className="mini-link" href={p.href} target="_blank" rel="noopener">{t.link} <ArrowUpRight size={14} /></a>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const visible = PROJECTS.filter((p) => filter === 'all' || p.categories.includes(filter));
  const featured = visible.filter((p) => p.featured);
  const compact = visible.filter((p) => !p.featured);

  return (
    <section className="sec" id="proyectos">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <div className="filters" role="group" aria-label={c.filter}>
            {FILTERS.map((f) => (
              <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label[lang]}
              </button>
            ))}
          </div>
        </div>
        {featured.length > 0 && (
          <div className="cases">
            {featured.map((p) => <FeaturedCase key={p.id} p={p} />)}
          </div>
        )}
        {compact.length > 0 && (
          <div className="more">
            {featured.length > 0 && <h3 className="more-title">{c.more}</h3>}
            <div className="mini-grid">
              {compact.map((p) => <CompactCase key={p.id} p={p} detailsLabel={c.details} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
