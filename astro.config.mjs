// @ts-check
import { cpSync, createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, resolve } from 'node:path';
import { defineConfig } from 'astro/config';

// The site folder holds the TalloRes data contract (see docs/data-contract.md).
// SITE_DIR lets tests and e2e point the build at a fixture site.
const siteDir = resolve(process.env.SITE_DIR ?? 'site');
const restaurant = JSON.parse(readFileSync(join(siteDir, 'restaurant.json'), 'utf8'));
const content = JSON.parse(readFileSync(join(siteDir, 'content.json'), 'utf8'));
const mainLang = content.languages[0];
// Only the selected template is imported, so only its fonts and CSS end up in the build.
const templateEntry = resolve('src/templates', content.template, 'Site.astro');
if (!existsSync(templateEntry)) throw new Error(`Unknown template "${content.template}" in ${join(siteDir, 'content.json')}`);

/** @type {Record<string, string>} */
const MIME = { '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif' };

/** Serves site/assets at /assets in dev and copies it to dist/assets on build (menu PDFs, logo, originals for og:image). */
/** @returns {import('astro').AstroIntegration} */
const siteAssets = () => ({
  name: 'site-assets',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use('/assets', (req, res, next) => {
        const file = normalize(join(siteDir, 'assets', decodeURIComponent((req.url ?? '').split('?')[0])));
        if (!file.startsWith(join(siteDir, 'assets')) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    'astro:build:done': ({ dir }) => {
      const src = join(siteDir, 'assets');
      const out = fileURLToPath(dir);
      if (existsSync(src)) cpSync(src, join(out, 'assets'), { recursive: true });
      // Cloudflare Workers static assets honour _redirects: a real 301 from / to the main language.
      writeFileSync(join(out, '_redirects'), `/  /${mainLang}/  301\n`);
    },
  },
});

export default defineConfig({
  site: restaurant.siteUrl,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Fallback for `astro preview` and hosts without _redirects (meta refresh page at /).
  redirects: { '/': `/${mainLang}/` },
  integrations: [siteAssets()],
  vite: {
    resolve: { alias: { '@site': siteDir, '@template': templateEntry } },
  },
});
