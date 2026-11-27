// Builds and verifies the current site/ data with EVERY template, so a change cannot break a template
// that this restaurant does not use (yet). Optional screenshots for visual review.
//
//   npm run templates:check                      build + verify all 5 templates
//   npm run templates:check -- --screens         also full-page screenshots (desktop 1280, mobile 390)
//   npm run templates:check -- bold cafe         only these templates
//
// Output: .tmp/templates/<id>/{site,dist,desktop.png,mobile.png}. Compare with docs/designs/*.png.
import { execFileSync } from 'node:child_process';
import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';
import { TEMPLATE_ORDER, TEMPLATES } from '../src/lib/catalog';
import type { TemplateId } from '../src/lib/types';

const args = process.argv.slice(2);
const screens = args.includes('--screens');
const only = args.filter((a) => !a.startsWith('--')) as TemplateId[];
const ids = only.length ? only : TEMPLATE_ORDER;
const src = resolve(process.env.SITE_DIR ?? 'site');
const root = resolve('.tmp/templates');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };

function serve(dir: string) {
  const server = createServer((req, res) => {
    let f = normalize(join(dir, decodeURIComponent((req.url ?? '/').split('?')[0])));
    if (!f.startsWith(dir)) { res.writeHead(403).end(); return; }
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
    if (!existsSync(f)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', MIME[extname(f)] ?? 'application/octet-stream');
    createReadStream(f).pipe(res);
  });
  return new Promise<{ url: string; close: () => void }>((ok) => server.listen(0, () => ok({ url: `http://localhost:${(server.address() as AddressInfo).port}`, close: () => server.close() })));
}

let failed = 0;
const results: string[] = [];
const browser = screens ? await (await import('@playwright/test')).chromium.launch() : undefined;

for (const id of ids) {
  if (!TEMPLATES[id]) { console.error(`Unknown template ${id}`); process.exit(2); }
  const dir = join(root, id);
  const site = join(dir, 'site');
  const dist = join(dir, 'dist');
  mkdirSync(site, { recursive: true });
  cpSync(src, site, { recursive: true });
  const content = JSON.parse(readFileSync(join(site, 'content.json'), 'utf8'));
  content.template = id;
  if (!TEMPLATES[id].palettes.some((p) => p.name === content.palette)) content.palette = TEMPLATES[id].palettes[0].name;
  writeFileSync(join(site, 'content.json'), JSON.stringify(content, null, 2));

  const env = { ...process.env, SITE_DIR: site };
  try {
    execFileSync(npx, ['astro', 'build', '--outDir', dist], { env, stdio: 'pipe', shell: process.platform === 'win32' });
    execFileSync(npx, ['tsx', 'scripts/verify-dist.ts', '--dir', dist], { env, stdio: 'inherit', shell: process.platform === 'win32' });
    results.push(`ok    ${id}`);
  } catch (e) {
    failed++;
    const out = (e as { stderr?: Buffer }).stderr?.toString().trim();
    if (out) console.error(out.split('\n').slice(-15).join('\n'));
    results.push(`FAIL  ${id}`);
    continue;
  }

  if (browser) {
    const { url, close } = await serve(dist);
    const main = content.languages[0];
    for (const [name, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]] as const) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      await page.goto(`${url}/${main}/`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(dir, `${name}.png`), fullPage: true });
      await page.close();
    }
    close();
  }
}

await browser?.close();
console.log(`\n${results.join('\n')}`);
if (screens) console.log(`\nScreenshots: ${root}/<template>/{desktop,mobile}.png`);
process.exit(failed ? 1 : 0);
