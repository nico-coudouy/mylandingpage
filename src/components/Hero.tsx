import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from './Icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTimecode } from '../hooks/useTimecode';
import { CV_URL } from '../data/profile';
import { useCopy } from '../i18n';

/** Faint dot grid behind the hero that warms up around the pointer. */
function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !hero || !ctx) return;

    let w = 0, h = 0, raf = 0, visible = true;
    let mx = -999, my = -999, tx = -999, ty = -999;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onMove = (e: globalThis.PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const onLeave = () => { tx = ty = -999; };

    const draw = (time: number) => {
      if (visible) {
        mx += (tx - mx) * 0.12;
        my += (ty - my) * 0.12;
        ctx.clearRect(0, 0, w, h);
        const sp = 34, t = time / 1000;
        for (let y = sp / 2; y < h; y += sp) {
          for (let x = sp / 2; x < w; x += sp) {
            const wave = Math.sin(x * 0.006 + t * 0.6) * Math.cos(y * 0.008 - t * 0.4);
            const glow = tx < -900 ? 0 : Math.max(0, 1 - Math.hypot(x - mx, y - my) / 220);
            const a = (0.04 + Math.max(0, wave) * 0.06 + glow * 0.55).toFixed(3);
            ctx.fillStyle = glow > 0.05 ? `rgba(255,91,31,${a})` : `rgba(242,238,231,${a})`;
            const s = 1.6 + glow * 1.6;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />;
}

const COPY = {
  es: {
    onAir: 'AL AIRE DESDE 2017',
    where: 'MAR DEL PLATA · REMOTO AR / LATAM',
    pre1: 'Convierto', word1: 'procesos', pre2: 'en', word2: 'software', rest: ' que funciona.',
    hello: 'Hola, soy Nico.',
    lead: 'Desarrollo web y automatización, con 9 años de experiencia en televisión en vivo en Canal 8 Mar del Plata.',
    projects: 'Ver proyectos',
    cv: 'Descargar CV',
    available: 'DISPONIBLE',
    cardTitle: 'Busco sumarme a un equipo y tomo proyectos puntuales.',
    cardText: 'Respondo en menos de 24 horas.',
    alt: 'Retrato de Nico Coudouy en blanco y negro',
    services: ['Desarrollo web', 'Automatización', 'Gráfica broadcast', 'Edición y streaming'],
    servicesLabel: 'Lo que hago',
  },
  en: {
    onAir: 'ON AIR SINCE 2017',
    where: 'MAR DEL PLATA, ARGENTINA · REMOTE',
    pre1: 'I turn', word1: 'processes', pre2: 'into', word2: 'software', rest: ' that works.',
    hello: "Hi, I'm Nico.",
    lead: 'Web development and automation, backed by 9 years of live TV operations at Canal 8 Mar del Plata.',
    projects: 'See projects',
    cv: 'Download CV (Spanish)',
    available: 'AVAILABLE',
    cardTitle: "I'm looking to join a team and I take on freelance projects.",
    cardText: 'I reply within 24 hours.',
    alt: 'Black-and-white portrait of Nico Coudouy',
    services: ['Web development', 'Automation', 'Broadcast graphics', 'Editing & streaming'],
    servicesLabel: 'What I do',
  },
};

export default function Hero() {
  const c = useCopy(COPY);
  const tc = useTimecode();
  return (
    <section className="hero" id="inicio">
      <DotField />
      <div className="wrap hero-stage">
        <div className="hero-top">
          <span className="onair"><i aria-hidden="true" />{c.onAir}<span className="tc" aria-hidden="true">{tc}</span></span>
          <span className="where">{c.where}</span>
        </div>

        <div className="hero-visual">
          <h1 className="hero-title">
            <span className="t1"><small>{c.pre1}</small> <b>{c.word1}</b></span>{' '}
            <span className="t2"><small>{c.pre2}</small> <b>{c.word2}</b></span>
            <span className="sr-only">{c.rest}</span>
          </h1>
          <img className="hero-photo" src="/assets/nico-cut.webp" alt={c.alt} width={640} height={566} fetchPriority="high" />
        </div>

        <div className="hero-intro">
          <p className="hello">{c.hello}</p>
          <p className="hero-lead">{c.lead}</p>
          <div className="ctas">
            <Link className="btn primary" to="/proyectos">{c.projects} <ArrowUpRight /></Link>
            <a className="btn" href={CV_URL} target="_blank" rel="noopener">{c.cv}</a>
          </div>
        </div>

        <div className="hero-card">
          <span className="avail"><i aria-hidden="true" />{c.available}</span>
          <b>{c.cardTitle}</b>
          <span>{c.cardText}</span>
        </div>

        <ol className="hero-svc" aria-label={c.servicesLabel}>
          {c.services.map((s, i) => (
            <li key={s}><span>● {String(i + 1).padStart(2, '0')}</span>{s}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
