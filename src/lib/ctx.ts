// View model shared by all templates. Ported from the hand-off render/common.ts (buildCtx).
// Difference: every string here is RAW text. Astro escapes `{expr}` output itself, so never
// pass these through `set:html`.
import { palette as getPalette, TEMPLATES, type Palette } from './catalog';
import { localized, text } from './content';
import { labels, type Labels } from './labels';
import { langPath, socialUrl } from './seo';
import { widgetUrl } from './widget';
import type { FieldKey, Lang, Photo, RestaurantData, SiteContent } from './types';

export interface Ctx {
  r: RestaurantData; c: SiteContent; lang: Lang; L: Labels; pal: Palette;
  /** Field text with main-language fallback. Empty string when unset. */
  t: (f: FieldKey) => string;
  name: string; initial: string;
  /** 0 = short name, 1 = medium, 2 = long: picks the headline size class. */
  nameStep: 0 | 1 | 2;
  hero?: Photo; about?: Photo; gallery: Photo[];
  hasAbout: boolean;
  vouchersUrl: string;
  menus: { name: string; note: string; url: string }[];
  hours: { day: number; label: string; text: string; closed: boolean }[];
  closures: string;
  groupLine: string;
  widgetSrc: string;
  langs: { code: Lang; href: string; current: boolean }[];
  mapSrc: string; routeHref: string; tel: string; telHref: string; email: string;
  socials: { label: string; href: string }[];
  addressLine: string; cityLine: string; company: string;
}

/** Long single words ("Gasthuishoeve") need a smaller headline too, or they break mid-word. */
const longestWord = (s: string) => Math.max(...s.split(/\s+/).map((w) => w.length));

const fmtTime = (ranges: [string, string][], sep: string) => ranges.map(([a, b]) => `${a}–${b}`).join(sep);

export function buildCtx(r: RestaurantData, c: SiteContent, lang: Lang, today = new Date()): Ctx {
  const L = labels(lang);
  const pal = getPalette(c.template, c.palette);
  const name = r.name.trim();
  const [s1, s2] = TEMPLATES[c.template].nameSteps;
  const todayIso = today.toISOString().slice(0, 10);
  const upcoming = r.closures.map((x) => x.date).filter((d) => d >= todayIso).sort().slice(0, 4);
  const dateFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' });
  const dates = upcoming.map((d) => dateFmt.format(new Date(d + 'T12:00:00')));
  const closures = dates.length ? `${L.closedOn} ${dates.length > 1 ? dates.slice(0, -1).join(', ') + ' ' + L.and + ' ' + dates[dates.length - 1] : dates[0]}` : '';
  const tel = r.phone.trim();
  const mapSrc = r.geo
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${r.geo.lng - 0.006},${r.geo.lat - 0.003},${r.geo.lng + 0.006},${r.geo.lat + 0.003}&layer=mapnik&marker=${r.geo.lat},${r.geo.lng}`
    : '';
  const addr = `${r.address.street}, ${r.address.postalCode} ${r.address.city}`;
  return {
    r, c, lang, L, pal,
    t: (f) => text(c, f, lang),
    name, initial: name.charAt(0).toUpperCase(),
    nameStep: Math.max(name.length <= s1 ? 0 : name.length <= s2 ? 1 : 2, longestWord(name) <= 9 ? 0 : longestWord(name) <= 12 ? 1 : 2) as 0 | 1 | 2,
    hero: c.heroPhoto, about: c.aboutPhoto,
    gallery: c.galleryOn ? c.gallery : [],
    hasAbout: !!(text(c, 'aboutTitle', lang) || text(c, 'aboutText', lang) || c.aboutPhoto),
    vouchersUrl: c.vouchersOn && r.vouchers.enabled && r.vouchers.url ? r.vouchers.url : '',
    menus: c.menus.map((m) => ({
      name: localized(c, m.name, lang),
      note: localized(c, m.description, lang) || `${L.updatedOn} ${dateFmt.format(new Date(m.uploadedAt))}`,
      url: m.url,
    })),
    hours: [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const h = r.hours.find((x) => x.day === d);
      const closed = !h || !h.ranges.length;
      return { day: d, label: L.days[d], text: closed ? L.closed : fmtTime(h!.ranges, ' · '), closed };
    }),
    closures,
    groupLine: r.maxOnlinePartySize ? L.groupLine.replace('{n}', String(r.maxOnlinePartySize)).replace('{phone}', tel) : '',
    widgetSrc: widgetUrl(r, { lang, hideHeader: true, primary: pal.wp, secondary: pal.ws }),
    langs: c.languages.map((l) => ({ code: l, href: langPath(l), current: l === lang })),
    mapSrc,
    routeHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${addr}`)}`,
    tel, telHref: `tel:${tel.replace(/[^+\d]/g, '')}`, email: r.email,
    socials: [
      ...(c.socials.instagram ? [{ label: 'Instagram', href: socialUrl(c.socials.instagram) }] : []),
      ...(c.socials.facebook ? [{ label: 'Facebook', href: socialUrl(c.socials.facebook) }] : []),
    ],
    addressLine: r.address.street, cityLine: `${r.address.postalCode} ${r.address.city}`,
    company: `${r.company.name} · ${r.company.enterpriseNumber}`,
  };
}

/** Data the page script reads to show "today" (static pages are rebuilt, but the day changes in the browser). */
export function todayData(x: Ctx) {
  return {
    hours: JSON.stringify([0, 1, 2, 3, 4, 5, 6].map((d) => x.r.hours.find((h) => h.day === d)?.ranges ?? [])),
    closures: JSON.stringify(x.r.closures.map((c) => c.date)),
    labels: JSON.stringify({ todayOpen: x.L.todayOpen, todayClosed: x.L.todayClosed, openUntil: x.L.openUntil, and: x.L.and }),
  };
}
