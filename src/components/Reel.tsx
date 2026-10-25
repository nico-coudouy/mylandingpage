import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Reel',
    title: 'Lo que hago, en un minuto.',
    play: 'Reproducir', pause: 'Pausar',
    soundOn: 'Activar sonido', soundOff: 'Silenciar',
    full: 'Pantalla completa', exitFull: 'Salir de pantalla completa',
    label: 'Reel de Nico Coudouy: televisión, desarrollo web y automatización',
  },
  en: {
    eyebrow: 'Reel',
    title: 'What I do, in a minute.',
    play: 'Play', pause: 'Pause',
    soundOn: 'Unmute', soundOff: 'Mute',
    full: 'Full screen', exitFull: 'Exit full screen',
    label: 'Nico Coudouy reel: live TV, web development and automation',
  },
};

const MOBILE = '(max-width: 700px)';

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00';
  const t = Math.floor(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/** The portfolio reel: 16:9 on desktop, the Instagram 9:16 cut on phones. */
export default function Reel() {
  const c = useCopy(COPY);
  const vertical = useMedia(MOBILE);
  const name = vertical ? 'reel-9x16' : 'reel-16x9';
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [full, setFull] = useState(false);

  // Switching between the desktop and phone cut loads a new file: start over.
  useEffect(() => {
    setPlaying(false);
    setStarted(false);
    setTime(0);
  }, [name]);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.muted = muted;
      v.play().catch(() => {});
      setStarted(true);
    } else v.pause();
  };

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const toggleFull = () => {
    const el = box.current, v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    else v?.webkitEnterFullscreen?.(); // iPhone Safari only allows the video element itself
  };

  return (
    <section className="sec reel-sec" id="reel" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
        </div>
        <div ref={box} className={`reel-player${vertical ? ' vert' : ''}${full ? ' full' : ''}`}>
          <div className="reel-stage">
            <video
              key={name}
              ref={video}
              src={`/assets/${name}.mp4`}
              poster={`/assets/${name}.jpg`}
              playsInline
              preload="none"
              aria-label={c.label}
              onClick={toggle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => { setPlaying(false); setStarted(false); }}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
            {!started && (
              <button type="button" className="reel-big" onClick={toggle} aria-label={c.play}>
                <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" /></svg>
              </button>
            )}
          </div>
          <div className="reel-bar">
            <button type="button" onClick={toggle} aria-label={playing ? c.pause : c.play} title={playing ? c.pause : c.play}>
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="reel-time">{fmt(time)} / {fmt(duration || (vertical ? 48 : 68))}</span>
            <span className="reel-prog" aria-hidden="true"><i style={{ transform: `scaleX(${duration ? time / duration : 0})` }} /></span>
            <button type="button" onClick={toggleSound} aria-label={muted ? c.soundOn : c.soundOff} title={muted ? c.soundOn : c.soundOff} aria-pressed={!muted}>
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
              )}
            </button>
            <button type="button" onClick={toggleFull} aria-label={full ? c.exitFull : c.full} title={full ? c.exitFull : c.full}>
              {full ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
