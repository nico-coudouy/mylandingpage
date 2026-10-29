import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import Nav from './components/Nav';
import Contact from './components/Contact';
import Assistant from './components/Assistant';
import Home from './pages/Home';
import { useCopy, useLang } from './i18n';
import { LEGACY_HASHES, ROUTES } from './routes';
import { formatTimecode } from './hooks/useTimecode';

// Inner pages load on demand, so the home page ships less code.
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const COPY = {
  es: { madeWith: 'HECHO CON REACT Y VERCEL', end: 'FIN DE TRANSMISIÓN', onAir: 'TIEMPO AL AIRE', notFound: 'Sin señal · Nico Coudouy' },
  en: { madeWith: 'MADE WITH REACT AND VERCEL', end: 'END OF TRANSMISSION', onAir: 'TIME ON AIR', notFound: 'No signal · Nico Coudouy' },
};

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value);
}

/** Scroll to the top on page change, keep the tab title in sync and send old #anchors to their page. */
function PageEffects() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();
  const c = useCopy(COPY);

  useEffect(() => {
    const to = LEGACY_HASHES[hash];
    if (to && pathname === '/') navigate(to, { replace: true });
  }, [hash, pathname, navigate]);

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Inner pages load lazily: wait a moment for the target section to exist, then scroll to it.
    let tries = 0, raf = 0;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ block: 'start' });
      else if (++tries < 90) raf = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  useEffect(() => {
    const found = ROUTES.find((x) => x.path === pathname);
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!found) {
      document.title = c.notFound;
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex';
      return;
    }
    robots?.remove();
    const r = found;
    document.title = r.title[lang];
    const url = `https://www.nicolascoudouy.com.ar${r.path === '/' ? '/' : r.path}`;
    setMeta('meta[name="description"]', 'content', r.description[lang]);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', r.title[lang]);
  }, [pathname, lang, c.notFound]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const known = ROUTES.some((r) => r.path === pathname);
  return (
    <>
      <PageEffects />
      <Nav />
      <main>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
        {known && <Contact />}
      </main>
      <Footer />
      <Assistant />
    </>
  );
}

/** Closing slate: the timecode freezes on how long the visitor has been on the site. */
function Footer() {
  const c = useCopy(COPY);
  const ref = useRef<HTMLElement>(null);
  const [tc, setTc] = useState('--:--:--:--');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTc(formatTimecode(performance.now()));
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <footer className="eot" ref={ref}>
      <div className="wrap">
        <div className="eot-main">
          <span className="eot-end"><i aria-hidden="true" />{c.end}</span>
          <span className="eot-tc">{c.onAir} <b>{tc}</b></span>
        </div>
        <div className="eot-meta">
          <span>© {new Date().getFullYear()} NICO COUDOUY · MAR DEL PLATA</span>
          <span>{c.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="proyectos" element={<ProjectsPage />} />
          <Route path="servicios" element={<ServicesPage />} />
          <Route path="sobre-mi" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
