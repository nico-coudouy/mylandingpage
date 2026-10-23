import { useState } from 'react';
import { FILTERS, PROJECTS, type Category, type Project } from '../data/projects';
import { ArrowUpRight } from './Icons';

function Case({ p }: { p: Project }) {
  return (
    <article className="case">
      <div className="media">{p.media}</div>
      <div>
        <div className="kicker">
          {p.logo && <img src={p.logo.src} alt={p.logo.alt} width={24} height={30} />}
          <span className="eyebrow">{p.eyebrow}</span>
          {p.badge && <span className="badge wip"><i />{p.badge}</span>}
        </div>
        <h3>{p.title}</h3>
        <p className="sum">{p.summary}</p>
        <dl className="psr">
          {p.details.map((d) => (
            <div key={d.label}><dt>{d.label}</dt><dd>{d.text}</dd></div>
          ))}
        </dl>
        <div className="tags">
          {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        {p.link && (
          <div className="plinks">
            <a className="btn" href={p.link.href} target="_blank" rel="noopener">{p.link.label} <ArrowUpRight /></a>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const visible = PROJECTS.filter((p) => filter === 'all' || p.categories.includes(filter));

  return (
    <section className="sec" id="proyectos">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Proyectos</span>
          <h2>Trabajo real, en uso todos los días.</h2>
          <div className="filters" role="group" aria-label="Filtrar proyectos">
            {FILTERS.map((f) => (
              <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cases">
          {visible.map((p) => <Case key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
