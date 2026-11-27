// Writes the demo restaurant (tests/fixtures.ts) as a site/ folder, so a fresh copy of this repo builds.
// Usage: npx tsx scripts/make-demo-site.ts [outDir=site] [template=klassiek]
// TalloRes overwrites restaurant.json, content.json and assets/ in a target repo.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { DEMO_RESTAURANT, demoContent } from '../tests/fixtures';
import type { TemplateId } from '../src/lib/types';

const out = resolve(process.argv[2] ?? 'site');
const template = (process.argv[3] ?? 'klassiek') as TemplateId;
mkdirSync(join(out, 'assets'), { recursive: true });

async function photo(file: string, label: string, bg: string, fg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="64" fill="${fg}">${label}</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 70 }).toFile(join(out, 'assets', file));
  return `assets/${file}`;
}

/** Smallest valid one-page PDF with a line of text. */
function pdf(title: string): Buffer {
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const stream = `BT /F1 28 Tf 72 760 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(body.length); body += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

const c = demoContent(template);
c.heroPhoto = { ...c.heroPhoto!, url: await photo('hero.jpg', 'Hoofdfoto', '#6b5040', '#f1e6d8') };
c.aboutPhoto = { ...c.aboutPhoto!, url: await photo('about.jpg', 'Chef', '#d8cfc2', '#6b5a50') };
c.gallery = await Promise.all(c.gallery.map(async (p, i) => ({ ...p, url: await photo(`gallery-${i + 1}.jpg`, p.alt.nl ?? '', '#d8cfc2', '#6b5a50') })));
for (const m of c.menus) {
  const file = `menu-${m.id}.pdf`;
  writeFileSync(join(out, 'assets', file), pdf(m.name.nl ?? m.id));
  m.url = `assets/${file}`;
}

writeFileSync(join(out, 'restaurant.json'), JSON.stringify(DEMO_RESTAURANT, null, 2) + '\n');
writeFileSync(join(out, 'content.json'), JSON.stringify(c, null, 2) + '\n');
console.log(`Demo site written to ${out} (template ${template}).`);
