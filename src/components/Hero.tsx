import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUpRight } from './Icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CV_URL } from '../data/profile';

/** Dot grid behind the hero that glows around the pointer. */
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
            const a = (0.05 + Math.max(0, wave) * 0.08 + glow * 0.5).toFixed(3);
            ctx.fillStyle = glow > 0.05 ? `rgba(46,230,166,${a})` : `rgba(150,175,220,${a})`;
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

/** Live SMPTE-style timecode at 25 fps, like a broadcast monitor. */
function useTimecode() {
  const [tc, setTc] = useState('00:00:00:00');
  useEffect(() => {
    const t0 = performance.now();
    const p = (n: number) => String(n).padStart(2, '0');
    const id = setInterval(() => {
      const f = Math.floor((performance.now() - t0) / 40);
      const s = Math.floor(f / 25);
      setTc(`00:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f % 25)}`);
    }, 40);
    return () => clearInterval(id);
  }, []);
  return tc;
}

function CameraMonitor() {
  const tc = useTimecode();
  const [focus, setFocus] = useState({ left: '50%', top: '42%' });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setFocus({
      left: `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`,
      top: `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`,
    });
  };

  return (
    <figure className="cam" style={{ margin: 0 }}>
      <div className="cam-top">
        <span className="tally"><i />CAM 1 · AL AIRE</span>
        <span id="tc">{tc}</span>
      </div>
      <div className="cam-view" onPointerMove={onMove} onPointerLeave={() => setFocus({ left: '50%', top: '42%' })}>
        <img src="/assets/nico.jpg" alt="Retrato de Nico Coudouy" width={640} height={641} />
        <div className="focus" style={focus} />
      </div>
      <figcaption className="cam-bot">
        <span>NICOLÁS COUDOUY</span>
        <span>1920×1080 · 50P</span>
      </figcaption>
    </figure>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <DotField />
      <div className="wrap">
        <div>
          <span className="status"><i />DISPONIBLE · MAR DEL PLATA · REMOTO AR / LATAM</span>
          <h1>Convierto procesos manuales en <em>software que funciona.</em></h1>
          <p className="lead">
            Desarrollo web y automatización, con 9 años de experiencia en operación televisiva en vivo en Canal 8 Mar del Plata.
          </p>
          <div className="ctas">
            <a className="btn primary" href="#proyectos">Ver proyectos <ArrowDown /></a>
            <a className="btn" href={CV_URL} target="_blank" rel="noopener">Descargar CV <ArrowUpRight /></a>
          </div>
        </div>
        <CameraMonitor />
      </div>
    </section>
  );
}
