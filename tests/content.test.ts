// Content rules and SEO/GEO output, ported from the hand-off website.test.ts.
import { describe, expect, it } from 'vitest';
import { FIELD_LIMITS, TEMPLATE_ORDER, TEMPLATES, templateDefault } from '../src/lib/catalog';
import { addLanguage, defaultContent, removeLanguage, seoChecklist, setField, switchTemplate, text } from '../src/lib/content';
import { hreflangLinks, llmsTxt, restaurantJsonLd, sitemapXml } from '../src/lib/seo';
import { widgetUrl } from '../src/lib/widget';
import { DEMO_RESTAURANT as R, demoContent } from './fixtures';

const TODAY = new Date('2026-11-26T12:00:00Z');

describe('content rules', () => {
  it('prefills from TalloRes and template defaults', () => {
    const c = defaultContent(R, 'klassiek');
    expect(text(c, 'overline', 'nl')).toBe('Brasserie · Mechelen');
    expect(text(c, 'reserveTitle', 'nl')).toBe('Reserveer een tafel');
    expect(c.languages).toEqual(['nl']);
    expect(c.edited).toEqual([]);
  });

  it('clips at the field limit and marks the field as edited', () => {
    const c = setField(defaultContent(R), 'tagline', 'nl', 'x'.repeat(200));
    expect(text(c, 'tagline', 'nl')).toHaveLength(FIELD_LIMITS.tagline);
    expect(c.edited).toContain('tagline');
  });

  it('template switch keeps edited copy and refreshes untouched defaults', () => {
    let c = defaultContent(R, 'klassiek');
    c = setField(c, 'reserveTitle', 'nl', 'Kom eten');
    const s = switchTemplate(c, 'trattoria');
    expect(text(s, 'reserveTitle', 'nl')).toBe('Kom eten');
    expect(text(s, 'menuTitle', 'nl')).toBe('Il menu');
    expect(text(s, 'hoursTitle', 'nl')).toBe('Orari');
    expect(s.palette).toBe('Terracotta');
    expect(text(switchTemplate(s, 'klassiek'), 'menuTitle', 'nl')).toBe('Menukaart');
  });

  it('languages: fallback to main, add, remove with texts, main cannot be removed', () => {
    let c = addLanguage(defaultContent(R), 'fr');
    expect(text(c, 'menuTitle', 'fr')).toBe('La carte'); // shipped default
    c = setField(c, 'tagline', 'nl', 'Seizoenskeuken');
    expect(text(c, 'tagline', 'fr')).toBe('Seizoenskeuken'); // falls back to main
    c = setField(c, 'tagline', 'fr', 'Cuisine de saison');
    expect(text(c, 'tagline', 'fr')).toBe('Cuisine de saison');
    const r = removeLanguage(c, 'fr');
    expect(r.languages).toEqual(['nl']);
    expect(r.fields.tagline.fr).toBeUndefined();
    expect(removeLanguage(c, 'nl')).toBe(c);
  });

  it('every template shows fields that have a limit, and every palette is complete', () => {
    for (const id of TEMPLATE_ORDER) {
      expect(TEMPLATES[id].palettes).toHaveLength(5);
      for (const f of TEMPLATES[id].fields) expect(FIELD_LIMITS[f]).toBeGreaterThan(0);
    }
    expect(templateDefault('bold', 'hoursTitle').nl).toBe('Open');
  });

  it('checklist warns about photos without a description', () => {
    const c = demoContent('klassiek');
    c.gallery[0] = { ...c.gallery[0], alt: {} };
    const warn = seoChecklist(c, R).filter((i) => !i.ok);
    expect(warn[0].title).toBe("1 foto zonder beschrijving");
  });
});

describe('SEO and GEO', () => {
  it('JSON-LD Restaurant with hours, closures, reservation and menus', () => {
    const ld = restaurantJsonLd(R, demoContent(), 'nl', TODAY) as any;
    expect(ld['@type']).toBe('Restaurant');
    expect(ld.openingHoursSpecification).toHaveLength(10); // 4 days × 2 ranges + Sat + Sun
    expect(ld.specialOpeningHoursSpecification.map((s: any) => s.validFrom)).toEqual(['2026-12-24', '2026-12-25']);
    expect(ld.potentialAction.target.urlTemplate).toContain('widget.tallores.com/form/mjrbnz296awyjw');
    expect(ld.hasMenu).toHaveLength(3);
    expect(restaurantJsonLd(R, { ...demoContent(), heroPhoto: { url: '/assets/hero.jpg', alt: {} } }, 'nl', TODAY).image).toContain('https://lindeboom.tallores.site/assets/hero.jpg');
    expect(ld.sameAs).toEqual(['https://www.instagram.com/brasserielindeboom/']);
  });

  it('hreflang only with 2+ languages, x-default is the main language', () => {
    const c = demoContent();
    expect(hreflangLinks(R, c)).toEqual([]);
    const m = addLanguage(c, 'fr');
    expect(hreflangLinks(R, m)).toContainEqual({ hreflang: 'x-default', href: 'https://lindeboom.tallores.site/nl/' });
    expect(sitemapXml(R, m, '2026-11-26')).toContain('hreflang="fr"');
  });

  it('llms.txt has address, hours and the booking link', () => {
    const txt = llmsTxt(R, demoContent());
    expect(txt).toContain('# Brasserie Lindeboom');
    expect(txt).toContain('- Maandag: Gesloten');
    expect(txt).toContain('Book a table: https://widget.tallores.com/form/');
  });

  it('widget URL carries language, header and theme', () => {
    expect(widgetUrl(R, { lang: 'fr', hideHeader: true, primary: '#7a1f2b', secondary: '#f7f1e8' }))
      .toBe('https://widget.tallores.com/form/mjrbnz296awyjw?iframe=true&lang=fr&header=0&primary=7a1f2b&secondary=f7f1e8');
  });
});
