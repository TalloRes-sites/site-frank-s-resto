// Data contract: schema validation, translations overlay priority and staleness, asset resolution.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { text } from '../src/lib/content';
import { applyTranslations, loadSite, publishedLanguages, resolveAsset, sourceHash, translationsSchema, type Translations } from '../src/lib/site-data';
import { DEMO_RESTAURANT as R, demoContent } from './fixtures';

const tr = (t: Partial<Translations>): Translations => translationsSchema.parse(t);

describe('published languages', () => {
  it('always includes nl, en and fr, main language first', () => {
    expect(publishedLanguages({ languages: ['nl'] })).toEqual(['nl', 'en', 'fr']);
    expect(publishedLanguages({ languages: ['fr', 'de'] })).toEqual(['fr', 'de', 'nl', 'en']);
  });
});

describe('translations overlay', () => {
  it('TalloRes copy wins over the overlay', () => {
    const c = demoContent();
    c.fields.tagline = { nl: 'Seizoenskeuken', en: 'From TalloRes' };
    const { content } = applyTranslations(c, tr({ fields: { tagline: { en: { text: 'From overlay', source: sourceHash('Seizoenskeuken') } } } }));
    expect(text(content, 'tagline', 'en')).toBe('From TalloRes');
  });

  it('fills missing languages from the overlay', () => {
    const c = demoContent();
    const src = text(c, 'tagline', 'nl');
    const { content, issues } = applyTranslations(c, tr({ fields: { tagline: { en: { text: 'Seasonal cooking', source: sourceHash(src) } } } }));
    expect(text(content, 'tagline', 'en')).toBe('Seasonal cooking');
    expect(issues.find((i) => i.path === 'fields.tagline' && i.lang === 'en')).toBeUndefined();
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'missing', path: 'fields.tagline', lang: 'fr', source: src }));
  });

  it('marks a translation stale when the main-language text changed', () => {
    const c = demoContent();
    const { content, issues } = applyTranslations(c, tr({ fields: { tagline: { en: { text: 'Old', source: sourceHash('something else') } } } }));
    expect(text(content, 'tagline', 'en')).toBe('Old'); // still used until re-translated
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'stale', path: 'fields.tagline', lang: 'en' }));
  });

  it('only reports fields the current template shows', () => {
    const c = demoContent('minimal'); // minimal does not show aboutTitle
    const { issues } = applyTranslations(c, tr({}));
    expect(issues.some((i) => i.path === 'fields.aboutTitle')).toBe(false);
    expect(issues.some((i) => i.path === 'fields.aboutText')).toBe(true);
  });

  it('covers photo alt texts, menus and SEO', () => {
    const { issues } = applyTranslations(demoContent(), tr({}));
    const paths = new Set(issues.map((i) => i.path.split('.')[0]));
    expect(paths).toEqual(new Set(['fields', 'photos', 'menus', 'seo']));
  });

  it('clips overlay text to the field limit', () => {
    const c = demoContent();
    const { content } = applyTranslations(c, tr({ fields: { tagline: { en: { text: 'x'.repeat(500), source: '' } } } }));
    expect(text(content, 'tagline', 'en')).toHaveLength(70);
  });
});

describe('assets', () => {
  it('resolves relative asset paths to /assets/, leaves URLs alone', () => {
    expect(resolveAsset('assets/hero.jpg')).toBe('/assets/hero.jpg');
    expect(resolveAsset('./assets/menu.pdf')).toBe('/assets/menu.pdf');
    expect(resolveAsset('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
    expect(resolveAsset('data:image/png;base64,xx')).toBe('data:image/png;base64,xx');
  });
});

describe('loadSite', () => {
  const site = (restaurant: unknown, content: unknown) => {
    const dir = mkdtempSync(join(tmpdir(), 'restosite-'));
    writeFileSync(join(dir, 'restaurant.json'), JSON.stringify(restaurant));
    writeFileSync(join(dir, 'content.json'), JSON.stringify(content));
    return dir;
  };

  it('loads a valid site without translations.json', () => {
    const c = demoContent();
    c.heroPhoto = { url: 'assets/hero.jpg', alt: { nl: 'Zaal' } };
    const data = loadSite(site(R, c));
    expect(data.content.languages).toEqual(['nl', 'en', 'fr']);
    expect(data.content.heroPhoto?.url).toBe('/assets/hero.jpg');
    expect(data.source.languages).toEqual(['nl']);
  });

  it('rejects invalid TalloRes data with the failing path', () => {
    expect(() => loadSite(site({ ...R, siteUrl: 'https://x.be/', hours: [{ day: 9, ranges: [['12', '14:00']] }] }, demoContent())))
      .toThrow(/siteUrl[\s\S]*hours\.0\.day|hours\.0\.day[\s\S]*siteUrl/);
  });
});
