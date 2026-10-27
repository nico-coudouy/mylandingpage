import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import Nav from './components/Nav';
import Contact from './components/Contact';
import Assistant from './components/Assistant';
import Home from './pages/Home';
import { useCopy, useLang } from './i18n';
import { LEGACY_HASHES, ROUTES } from './routes';

// Inner pages load on demand, so the home page ships less code.
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

const COPY = {
  es: { madeWith: 'HECHO CON REACT Y VERCEL', notFound: 'Esta página no existe.', home: 'Volver al inicio' },
  en: { madeWith: 'MADE WITH REACT AND VERCEL', notFound: "This page doesn't exist.", home: 'Back to home' },
};

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value);
}

/** Scroll to the top on page change, keep the tab title in sync and send old #anchors to their page. */
function PageEffects() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();

  useEffect(() => {
    const to = LEGACY_HASHES[hash];
    if (to && pathname === '/') navigate(to, { replace: true });
  }, [hash, pathname, navigate]);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    const r = ROUTES.find((x) => x.path === pathname) ?? ROUTES[0];
    document.title = r.title[lang];
    const url = `https://www.nicolascoudouy.com.ar${r.path === '/' ? '/' : r.path}`;
    setMeta('meta[name="description"]', 'content', r.description[lang]);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', r.title[lang]);
  }, [pathname, lang]);

  return null;
}

function Layout() {
  const c = useCopy(COPY);
  return (
    <>
      <PageEffects />
      <Nav />
      <main>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
        <Contact />
      </main>
      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} NICO COUDOUY · MAR DEL PLATA</span>
          <span>{c.madeWith}</span>
        </div>
      </footer>
      <Assistant />
    </>
  );
}

function NotFound() {
  const c = useCopy(COPY);
  return (
    <section className="sec">
      <div className="wrap sec-head">
        <span className="eyebrow">404</span>
        <h2>{c.notFound}</h2>
        <a className="btn primary" href="/" style={{ alignSelf: 'flex-start' }}>{c.home}</a>
      </div>
    </section>
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
