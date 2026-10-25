import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';

type Props = { src: string; poster: string; label?: string; onProgress?: (p: number) => void };

/**
 * Muted looping video that plays while it is on screen.
 *
 * It autoplays even with prefers-reduced-motion: Windows turns that on whenever
 * "Animation effects" is off, which left every video frozen on many desktops.
 * The pause button covers the accessibility side (WCAG 2.2.2), and a manual
 * pause sticks until the visitor presses play again.
 */
export default function AutoVideo({ src, poster, label, onProgress }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // React does not reflect `muted` as an attribute, and autoplay needs it.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused.current) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const action = playing ? (lang === 'es' ? 'Pausar video' : 'Pause video') : (lang === 'es' ? 'Reproducir video' : 'Play video');

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onProgress ? (e) => { const v = e.currentTarget; if (v.duration) onProgress(v.currentTime / v.duration); } : undefined}
      />
      <button type="button" className="vid-toggle" onClick={toggle} aria-label={action} title={action}>
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor" /></svg>
        )}
      </button>
    </>
  );
}
