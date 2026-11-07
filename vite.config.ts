import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { ROUTES } from './src/routes';

const SITE = 'https://www.nicolascoudouy.com.ar';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Writes one HTML file per page (proyectos.html, herramientas/fotos-a-pdf.html…) with its own title,
 * description and canonical URL, so search engines and link previews see the right
 * text without running JavaScript. Vercel serves them at /proyectos etc. (cleanUrls).
 */
function pageHtml(): Plugin {
  return {
    name: 'page-html',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const base = readFileSync(resolve(dist, 'index.html'), 'utf8');
      for (const r of ROUTES) {
        if (r.path === '/') continue;
        const url = SITE + r.path;
        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title.es)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(r.description.es)}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(r.title.es)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(r.description.es)}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
        const file = resolve(dist, `${r.path.slice(1)}.html`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }
      // Sitemap built from the same list, so a new page can't be forgotten.
      const today = new Date().toISOString().slice(0, 10);
      const urls = ROUTES.map((r) => `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n');
      writeFileSync(
        resolve(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), pageHtml()],
  build: {
    rollupOptions: {
      // pdf-lib is shared by the two PDF tools: keep it in its own file so both reuse the cached copy.
      output: { manualChunks: { 'pdf-lib': ['pdf-lib'] } },
    },
    // The HEIC decoder (~3 MB) is expected: it only downloads when someone opens an iPhone photo.
    chunkSizeWarningLimit: 3300,
  },
});
