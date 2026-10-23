import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = { src: string; poster: string; label?: string };

/** Muted looping video that only plays while it is on screen. */
export default function AutoVideo({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // React does not reflect `muted` as an attribute, and autoplay needs it.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduce) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src, reduce]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={!reduce}
      preload="metadata"
      aria-label={label}
    />
  );
}
