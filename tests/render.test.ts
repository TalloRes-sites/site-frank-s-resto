// Renders every template through the Astro Container API, across the variants that broke designs
// before: with/without photos, short/long names, one/three languages. Guards the hand-off rules.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import { TEMPLATE_ORDER } from '../src/lib/catalog';
import { addLanguage, setField } from '../src/lib/content';
import { buildCtx } from '../src/lib/ctx';
import type { Lang, RestaurantData, SiteContent, TemplateId } from '../src/lib/types';
import Bold from '../src/templates/bold/Site.astro';
import Cafe from '../src/templates/cafe/Site.astro';
import Klassiek from '../src/templates/klassiek/Site.astro';
import Minimal from '../src/templates/minimal/Site.astro';
import Trattoria from '../src/templates/trattoria/Site.astro';
import { DEMO_RESTAURANT as R, demoContent } from './fixtures';

const TODAY = new Date('2026-11-26T12:00:00Z');
const SITES: Record<TemplateId, any> = { klassiek: Klassiek, minimal: Minimal, bold: Bold, trattoria: Trattoria, cafe: Cafe };
const LONG_NAME = 'Brasserie De Oude Lindeboom aan de Dijle';

let container: AstroContainer;
beforeAll(async () => { container = await AstroContainer.create(); });

async function render(content: SiteContent, opts: { restaurant?: RestaurantData; lang?: Lang } = {}) {
  const x = buildCtx(opts.restaurant ?? R, content, opts.lang ?? content.languages[0], TODAY);
  return container.renderToString(SITES[content.template], { props: { x, today: TODAY } });
}

const threeLangs = (c: SiteContent) => addLanguage(addLanguage(c, 'en'), 'fr');
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe.each(TEMPLATE_ORDER)('template %s', (id) => {
  it('renders a complete page with every block', async () => {
    const html = await render(demoContent(id));
    expect(html).toMatch(/^(<!DOCTYPE html>)?<html lang="nl">/i); // the container omits the doctype pages get
    expect(html).not.toMatch(/undefined|NaN|\[object Object\]/);
    expect(html).toContain('application/ld+json');
    expect(html).toContain('data-widget');
    expect(html).toContain('id="tr-book"');
    expect(html).toContain('data-open-book');
    expect(html).toContain(R.company.enterpriseNumber);
    expect(html).toContain('Gesloten op 24 december en 25 december');
    expect(html).toContain('Meer dan 10 personen? Bel ons op 015 00 00 00.');
    expect(html).toContain('href="privacy/"');
    expect(count(html, /<h1[ >]/g)).toBe(1);
  });

  it('without photos: a finished page with no images', async () => {
    const html = await render(demoContent(id, { photos: false }));
    expect(html).not.toContain('<img');
    expect(count(html, /<h1[ >]/g)).toBe(1);
  });

  it('without a tagline: still exactly one h1', async () => {
    const c = demoContent(id);
    c.fields.tagline = {};
    const html = await render(c);
    expect(count(html, /<h1[ >]/g)).toBe(1);
  });

  it('long names: one h1, no broken output', async () => {
    const html = await render(demoContent(id), { restaurant: { ...R, name: LONG_NAME } });
    expect(count(html, /<h1[ >]/g)).toBe(1);
    expect(html).not.toMatch(/undefined|NaN/);
  });

  it('one language: no switcher, no hreflang', async () => {
    const html = await render(demoContent(id));
    expect(html).not.toContain('hreflang=');
    expect(html).not.toContain('class="lang m-only"');
  });

  it('three languages: switcher, hreflang and labels follow the language', async () => {
    const html = await render(threeLangs(demoContent(id)), { lang: 'fr' });
    expect(html).toMatch(/<html lang="fr">/);
    expect(html).toContain('Réserver une table');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('href="/nl/"');
    expect(html).toContain('class="lang m-only"');
  });

  it('vouchers off: no voucher button or block', async () => {
    const html = await render(demoContent(id), { restaurant: { ...R, vouchers: { enabled: false } } });
    expect(html).not.toContain('Cadeaubon kopen');
  });

  it('escapes restaurant input', async () => {
    const c = setField(demoContent(id), 'tagline', 'nl', '<script>alert(1)</script>');
    const html = await render(c, { restaurant: { ...R, name: 'A & B <b>' } });
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script&gt;alert(1)');
    expect(html).toContain('A &amp; B &lt;b&gt;');
  });

  it('no cookies or trackers: the map loads only after a click', async () => {
    const html = await render(demoContent(id));
    expect(html).not.toContain('openstreetmap.org/export/embed.html"'); // not as an iframe src
    expect(html).toContain('data-map="https://www.openstreetmap.org/export/embed.html');
    expect(html).not.toMatch(/google-analytics|googletagmanager|gtag\(|fbq\(|document\.cookie/);
  });
});

it('long names get the smaller headline step', async () => {
  const html = await render(demoContent('bold'), { restaurant: { ...R, name: LONG_NAME } });
  expect(html).toContain('b-nm2');
});

it('JSON-LD cannot break out of its script tag', async () => {
  const c = demoContent('klassiek');
  c.seo.description = { nl: '</script><script>alert(1)</script>' };
  const html = await render(c);
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
  expect(ld).not.toContain('</script');
  expect(JSON.parse(ld).description).toBe('</script><script>alert(1)</script>');
  // In a quoted attribute "<" is plain text for the HTML parser, so Astro does not escape it there.
  expect(html).toContain('<meta name="description" content="</script><script>alert(1)</script>">');
});
