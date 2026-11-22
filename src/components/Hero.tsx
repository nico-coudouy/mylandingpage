import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from './Icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CV_URL } from '../data/profile';
import { useCopy, useLang } from '../i18n';
import { portraitCode, startLensHero, type LensHero, type LensLabels } from '../lib/lensHero';
import zocaloSource from '../lib/zocalo.ts?raw';

/** El retrato final se dibuja con el código real del sitio. */
const CODE = portraitCode(zocaloSource);

const COPY = {
  es: {
    onAir: 'AL AIRE DESDE 2017',
    where: 'MAR DEL PLATA · REMOTO AR / LATAM',
    steps: ['01 FOCO', '02 SENSOR', '03 CÓDIGO'],
    skip: 'SALTAR INTRO ↓',
    hint: 'SCROLLEÁ',
    pre1: 'Convierto', word1: 'procesos', pre2: 'en', word2: 'software', rest: 'que funciona.',
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
    labels: {
      out: 'FUERA DE FOCO', focusing: 'ENFOCANDO', ok: 'EN FOCO', sensor: 'LECTURA DEL SENSOR', code: 'RAW → CÓDIGO',
      faceSearch: 'AF · BUSCANDO', faceLock: 'AF · ROSTRO', luma: 'LUMA', chars: 'CARACTERES',
    } satisfies LensLabels,
  },
  en: {
    onAir: 'ON AIR SINCE 2017',
    where: 'MAR DEL PLATA, ARGENTINA · REMOTE',
    steps: ['01 FOCUS', '02 SENSOR', '03 CODE'],
    skip: 'SKIP INTRO ↓',
    hint: 'SCROLL',
    pre1: 'I turn', word1: 'processes', pre2: 'into', word2: 'software', rest: 'that works.',
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
    labels: {
      out: 'OUT OF FOCUS', focusing: 'FOCUSING', ok: 'IN FOCUS', sensor: 'SENSOR READOUT', code: 'RAW → CODE',
      faceSearch: 'AF · SEARCHING', faceLock: 'AF · FACE', luma: 'LUMA', chars: 'CHARACTERS',
    } satisfies LensLabels,
  },
};

/**
 * Hero "del lente al código": la foto se enfoca sola al cargar y, con el scroll, pasa al sensor
 * y se convierte en código. La animación vive en src/lib/lensHero.ts. Con "reducir movimiento"
 * se muestra directo el estado final, sin scroll extra.
 */
export default function Hero() {
  const c = useCopy(COPY);
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<LensHero | null>(null);
  const labelsRef = useRef(c.labels);
  labelsRef.current = c.labels;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const hero = startLensHero(root, { reduce, code: CODE, labels: () => labelsRef.current });
    heroRef.current = hero;
    return () => { hero.destroy(); heroRef.current = null; };
  }, [reduce]);

  // Las palabras de fondo cambian de largo con el idioma.
  useEffect(() => { heroRef.current?.refit(); }, [lang]);

  const services = (
    <>
      {c.services.map((s, i) => (
        <li key={s}><span>● {String(i + 1).padStart(2, '0')}</span>{s}</li>
      ))}
    </>
  );

  return (
    <>
      <section className={`lens${reduce ? ' reduce' : ''}`} id="inicio" ref={rootRef}>
        <div className="lens-stage" data-l="stage">
          <canvas className="lens-field" data-l="field" aria-hidden="true" />
          <div className="lens-safe" aria-hidden="true">
            <i className="act" /><i className="tit" />
            <span className="la">ACTION SAFE 93%</span><span className="lt">TITLE SAFE 90%</span>
          </div>
          <div className="lens-hud" aria-hidden="true"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>

          <div className="lens-row r1" aria-hidden="true">
            <span className="lens-onair"><i />{c.onAir}<span className="tc" data-l="tc">00:00:00:00</span></span>
            <span className="lens-where">{c.where}</span>
          </div>
          <div className="lens-row r2" aria-hidden="true">
            <span><b>NICO COUDOUY</b> · DEV + BROADCAST</span>
            <span className="lens-fstate" data-l="fstate" />
          </div>
          <div className="lens-row r3">
            <span className="lens-steps" aria-hidden="true">
              <span data-l="s1" className="on">{c.steps[0]}</span><span data-l="s2">{c.steps[1]}</span><span data-l="s3">{c.steps[2]}</span>
            </span>
            <button className="lens-skip" type="button" data-l="skip" onClick={() => heroRef.current?.skip()}>{c.skip}</button>
          </div>

          <div className="lens-back" data-l="back" aria-hidden="true">
            <div className="lens-glow" data-l="glow" />
            <div className="lens-words" data-l="words"><div>{c.word1}</div><div className="w2">{c.word2}</div></div>
          </div>

          <div className="lens-shot" data-l="shot">
            <div className="lens-media">
              <img data-l="photo" src="/assets/nico-cut.webp" alt={c.alt} width={640} height={566} fetchPriority="high" />
              <canvas data-l="peak" className="lens-peak" aria-hidden="true" />
              <canvas data-l="cv" aria-hidden="true" />
            </div>
            <div className="lens-face" data-l="face" aria-hidden="true"><i className="a" /><i className="b" /><i className="c" /><i className="d" /><span data-l="faceLbl" /></div>
            <div className="lens-probe" data-l="probe" aria-hidden="true"><span className="tag" data-l="ptag" /></div>
          </div>

          <div className="lens-meter lens-hist" data-l="histWrap" aria-hidden="true"><span data-l="histLbl">LUMA</span><canvas data-l="hist" /></div>
          <div className="lens-meter lens-vu" data-l="vuWrap" aria-hidden="true"><canvas data-l="vu" /><span>L · R</span></div>
          <div className="lens-meter lens-cambar" data-l="cambar" aria-hidden="true"><b>4K 25p</b> · HD 1080i50<span className="wb"> · 5600K</span></div>

          <div className="lens-ring" data-l="ring" aria-hidden="true">
            <span className="idx" />
            <div className="win"><div className="scale" data-l="scale">
              {['0.3', '0.5', '0.7', '1', '1.5', '2', '3', '5', '10', '∞'].map((d) => <span key={d}>{d}</span>)}
            </div></div>
            <div className="knurl" data-l="knurl" />
          </div>
          <div className="lens-hint" data-l="hint" aria-hidden="true">{c.hint}</div>

          <div className="lens-copy" data-l="copy">
            <div className="in">
              <p className="lens-hello">{c.hello}</p>
              <h1 className="lens-title">
                <small>{c.pre1}</small> {c.word1} <small>{c.pre2}</small> <em>{c.word2}</em> <small>{c.rest}</small>
              </h1>
              <p className="lens-lead">{c.lead}</p>
              <p className="lens-avail">
                <b>{c.available}</b>
                <span className="short">{c.cardText}</span>
                <span className="long">{c.cardTitle} {c.cardText}</span>
              </p>
              <div className="ctas">
                <Link className="btn primary" to="/proyectos">{c.projects} <ArrowUpRight /></Link>
                <a className="btn" href={CV_URL} target="_blank" rel="noopener">{c.cv}</a>
              </div>
            </div>
          </div>

          <ol className="lens-svc lens-svc-stage" data-l="svc" aria-label={c.servicesLabel}>{services}</ol>
        </div>
      </section>
      <div className="lens-svc-flow">
        <ol className="lens-svc" aria-label={c.servicesLabel}>{services}</ol>
      </div>
    </>
  );
}
