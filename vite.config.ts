import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { ROUTES } from './src/routes';

const SITE = 'https://www.nicolascoudouy.com.ar';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Writes one HTML file per page (proyectos.html, servicios.html…) with its own title,
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
        writeFileSync(resolve(dist, `${r.path.slice(1)}.html`), html);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), pageHtml()],
});
