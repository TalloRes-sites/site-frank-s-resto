import { localized, text } from './content';
import { labels } from './labels';
import { widgetUrl } from './widget';
import type { Lang, RestaurantData, SiteContent } from './types';

const DAY_IRI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => `https://schema.org/${d}`);

/** Path of a language version. Every language lives under its own prefix; "/" redirects to the main language. */
export const langPath = (lang: Lang) => `/${lang}/`;
export const pageUrl = (r: RestaurantData, lang: Lang) => `${r.siteUrl}${langPath(lang)}`;

/** Root-relative asset paths ("/assets/hero.jpg") become absolute for crawlers; other URLs pass through. */
export const absUrl = (r: RestaurantData, url: string) => (url.startsWith('/') ? `${r.siteUrl}${url}` : url);

/** schema.org Restaurant as JSON-LD, built from TalloRes data plus site content. */
export function restaurantJsonLd(r: RestaurantData, c: SiteContent, lang: Lang, today = new Date()): Record<string, unknown> {
  const todayIso = today.toISOString().slice(0, 10);
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    url: pageUrl(r, lang),
    telephone: r.phone,
    email: r.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address.street, postalCode: r.address.postalCode,
      addressLocality: r.address.city, addressCountry: r.address.country,
    },
    acceptsReservations: true,
    openingHoursSpecification: r.hours.flatMap((d) => d.ranges.map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_IRI[d.day], opens, closes,
    }))),
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: widgetUrl(r, { lang }), inLanguage: lang, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
      result: { '@type': 'FoodEstablishmentReservation', name: labels(lang).reserveTable },
    },
  };
  if (r.cuisine) ld.servesCuisine = r.cuisine;
  if (r.geo) ld.geo = { '@type': 'GeoCoordinates', latitude: r.geo.lat, longitude: r.geo.lng };
  const upcoming = r.closures.filter((x) => x.date >= todayIso);
  if (upcoming.length) {
    ld.specialOpeningHoursSpecification = upcoming.map((x) => ({
      '@type': 'OpeningHoursSpecification', validFrom: x.date, validThrough: x.date, opens: '00:00', closes: '00:00',
    }));
  }
  if (c.menus.length) ld.hasMenu = c.menus.map((m) => absUrl(r, m.url));
  const images = [c.heroPhoto, c.aboutPhoto, ...c.gallery].filter(Boolean).map((p) => absUrl(r, p!.url));
  if (images.length) ld.image = images;
  const sameAs = [c.socials.instagram, c.socials.facebook].filter(Boolean).map((s) => socialUrl(s!));
  if (sameAs.length) ld.sameAs = sameAs;
  const desc = localized(c, c.seo.description, lang);
  if (desc) ld.description = desc;
  return ld;
}

/** "@name" becomes an Instagram URL; full URLs pass through. */
export function socialUrl(handle: string): string {
  const h = handle.trim();
  if (/^https?:\/\//.test(h)) return h;
  if (h.startsWith('@')) return `https://www.instagram.com/${h.slice(1)}/`;
  return `https://${h.replace(/^\/+/, '')}`;
}

/** <link rel="alternate" hreflang> tags for every language plus x-default (main language). */
export function hreflangLinks(r: RestaurantData, c: SiteContent): { hreflang: string; href: string }[] {
  if (c.languages.length < 2) return [];
  return [
    ...c.languages.map((l) => ({ hreflang: l, href: pageUrl(r, l) })),
    { hreflang: 'x-default', href: pageUrl(r, c.languages[0]) },
  ];
}

export interface PageMeta { title: string; description: string; canonical: string; ogImage?: string }
export function pageMeta(r: RestaurantData, c: SiteContent, lang: Lang): PageMeta {
  return {
    title: localized(c, c.seo.title, lang) || r.name,
    description: localized(c, c.seo.description, lang) || [text(c, 'tagline', lang), `${r.address.street}, ${r.address.city}`].filter(Boolean).join('. '),
    canonical: pageUrl(r, lang),
    ogImage: c.heroPhoto ? absUrl(r, c.heroPhoto.url) : undefined,
  };
}

/** Plain-text summary for AI assistants, served at /llms.txt. */
export function llmsTxt(r: RestaurantData, c: SiteContent): string {
  const lang = c.languages[0];
  const L = labels(lang);
  const hours = r.hours.length
    ? [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const h = r.hours.find((x) => x.day === d);
      return `- ${L.days[d]}: ${h && h.ranges.length ? h.ranges.map(([a, b]) => `${a}-${b}`).join(', ') : L.closed}`;
    }).join('\n')
    : '';
  const lines = [
    `# ${r.name}`,
    '',
    `> ${[r.cuisine, text(c, 'tagline', lang)].filter(Boolean).join('. ')}`,
    '',
    `- Address: ${r.address.street}, ${r.address.postalCode} ${r.address.city}`,
    `- Phone: ${r.phone}`,
    `- Email: ${r.email}`,
    `- Book a table: ${widgetUrl(r, { lang })}`,
    c.vouchersOn && r.vouchers.enabled && r.vouchers.url ? `- Gift vouchers: ${r.vouchers.url}` : '',
    '',
    '## Opening hours',
    hours,
    '',
    c.menus.length ? '## Menus' : '',
    ...c.menus.map((m) => `- [${localized(c, m.name, lang)}](${absUrl(r, m.url)})`),
    '',
    `## About`,
    text(c, 'aboutText', lang),
    '',
    `Languages: ${c.languages.map((l) => pageUrl(r, l)).join(', ')}`,
  ];
  return lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n').trim() + '\n';
}

export function sitemapXml(r: RestaurantData, c: SiteContent, lastmod: string): string {
  const urls = c.languages.map((l) => {
    const alts = c.languages.length > 1 ? c.languages.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${pageUrl(r, a)}"/>`).join('') : '';
    return `<url><loc>${pageUrl(r, l)}</loc><lastmod>${lastmod}</lastmod>${alts}</url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

/** Search and AI crawlers are allowed by default. */
export const robotsTxt = (r: RestaurantData) => `User-agent: *\nAllow: /\n\nSitemap: ${r.siteUrl}/sitemap.xml\n`;
