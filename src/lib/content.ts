import { FIELD_LIMITS, TEMPLATES, templateDefault, PHOTO_ALT_LIMIT } from './catalog';
import type { FieldKey, Lang, Localized, Photo, RestaurantData, SiteContent, TemplateId } from './types';

const ALL_FIELDS = Object.keys(FIELD_LIMITS) as FieldKey[];

const clip = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);

/** Content for a freshly activated site: template defaults plus what TalloRes knows. */
export function defaultContent(r: RestaurantData, template: TemplateId = 'klassiek', mainLang: Lang = 'nl'): SiteContent {
  const fields = Object.fromEntries(ALL_FIELDS.map((f) => [f, templateDefault(template, f)])) as Record<FieldKey, Localized>;
  fields.overline = { [mainLang]: clip([r.cuisine, r.address.city].filter(Boolean).join(' · '), FIELD_LIMITS.overline) };
  return {
    template,
    palette: TEMPLATES[template].palettes[0].name,
    languages: [mainLang],
    fields,
    edited: [],
    gallery: [],
    galleryOn: true,
    vouchersOn: true,
    menus: [],
    socials: {},
    seo: {
      title: { [mainLang]: `${r.name} · ${r.cuisine ? r.cuisine + ' in ' : ''}${r.address.city}` },
      description: {},
    },
  };
}

/** Text for a field in a language, falling back to the main language. Empty string when nothing is set. */
export function text(c: SiteContent, field: FieldKey, lang: Lang): string {
  const v = c.fields[field] ?? {};
  return (v[lang] ?? '').trim() || (v[c.languages[0]] ?? '').trim();
}

/** Any localized value with main-language fallback. */
export function localized(c: SiteContent, v: Localized | undefined, lang: Lang): string {
  return ((v?.[lang] ?? '').trim() || (v?.[c.languages[0]] ?? '').trim());
}

/** Set a field in one language. Clips to the field limit and marks the field as edited. */
export function setField(c: SiteContent, field: FieldKey, lang: Lang, value: string): SiteContent {
  return {
    ...c,
    fields: { ...c.fields, [field]: { ...c.fields[field], [lang]: clip(value, FIELD_LIMITS[field]) } },
    edited: c.edited.includes(field) ? c.edited : [...c.edited, field],
  };
}

export function setPhotoAlt(photo: Photo, lang: Lang, alt: string): Photo {
  return { ...photo, alt: { ...photo.alt, [lang]: clip(alt, PHOTO_ALT_LIMIT) } };
}

/**
 * Switch template. Edited copy is always kept. Untouched fields take the new template's defaults.
 * The palette resets to the new template's first palette unless `paletteName` is given.
 */
export function switchTemplate(c: SiteContent, to: TemplateId, paletteName?: string): SiteContent {
  const fields = { ...c.fields };
  for (const f of ALL_FIELDS) {
    if (!c.edited.includes(f) && f !== 'overline' && f !== 'tagline') fields[f] = templateDefault(to, f);
  }
  const names = TEMPLATES[to].palettes.map((p) => p.name);
  return { ...c, template: to, palette: paletteName && names.includes(paletteName) ? paletteName : names[0], fields };
}

/** Fields the CMS shows for the current template, in page order. */
export const fieldsFor = (t: TemplateId): FieldKey[] => TEMPLATES[t].fields;

export function addLanguage(c: SiteContent, lang: Lang): SiteContent {
  return c.languages.includes(lang) ? c : { ...c, languages: [...c.languages, lang] };
}

/** Remove a language and all its texts. The main language cannot be removed. */
export function removeLanguage(c: SiteContent, lang: Lang): SiteContent {
  if (lang === c.languages[0] || !c.languages.includes(lang)) return c;
  const strip = (v: Localized): Localized => { const { [lang]: _gone, ...rest } = v; return rest; };
  const stripPhoto = (p?: Photo) => (p ? { ...p, alt: strip(p.alt) } : p);
  return {
    ...c,
    languages: c.languages.filter((l) => l !== lang),
    fields: Object.fromEntries(Object.entries(c.fields).map(([k, v]) => [k, strip(v)])) as Record<FieldKey, Localized>,
    heroPhoto: stripPhoto(c.heroPhoto),
    aboutPhoto: stripPhoto(c.aboutPhoto),
    gallery: c.gallery.map((p) => stripPhoto(p)!),
    menus: c.menus.map((m) => ({ ...m, name: strip(m.name), description: strip(m.description) })),
    seo: { title: strip(c.seo.title), description: strip(c.seo.description) },
  };
}

/** Photos that are actually shown. The gallery only counts when switched on. */
export function photosInUse(c: SiteContent): { where: string; photo: Photo }[] {
  const out: { where: string; photo: Photo }[] = [];
  if (c.heroPhoto) out.push({ where: 'Hero', photo: c.heroPhoto });
  if (c.aboutPhoto) out.push({ where: 'Over ons', photo: c.aboutPhoto });
  if (c.galleryOn) c.gallery.forEach((p, i) => out.push({ where: `Galerij ${i + 1}`, photo: p }));
  return out;
}

export interface CheckItem { ok: boolean; title: string; text: string }

/** Findability checklist for the Publiceren tab. Automatic items are always ok; content gaps warn. */
export function seoChecklist(c: SiteContent, r: RestaurantData): CheckItem[] {
  const main = c.languages[0];
  const noAlt = photosInUse(c).filter(({ photo }) => !(photo.alt[main] ?? '').trim());
  return [
    { ok: true, title: 'Restaurantgegevens voor Google', text: 'Naam, adres, openingsuren, keuken en reserveerlink als gestructureerde data.' },
    { ok: true, title: c.languages.length > 1 ? 'Eén adres per taal' : 'Taal aangegeven', text: c.languages.length > 1 ? 'Elke taal krijgt een eigen pagina, met verwijzingen naar elkaar.' : 'Zoekmachines weten in welke taal je site is.' },
    { ok: true, title: 'Sitemap en snelle laadtijd', text: "Foto's worden verkleind, de pagina laadt zonder trackers." },
    { ok: true, title: 'Leesbaar voor AI-assistenten', text: 'Een korte samenvatting van je restaurant in gewone tekst.' },
    noAlt.length
      ? { ok: false, title: `${noAlt.length} foto${noAlt.length > 1 ? "'s" : ''} zonder beschrijving`, text: `Voeg een beschrijving toe bij: ${noAlt.map((x) => x.where).join(', ')}.` }
      : { ok: true, title: "Alle foto's hebben een beschrijving", text: 'Goed voor Google en schermlezers.' },
    (c.seo.description[main] ?? '').trim()
      ? { ok: true, title: 'Omschrijving voor Google ingevuld', text: 'Wordt getoond onder je naam in de zoekresultaten.' }
      : { ok: false, title: 'Geen omschrijving voor Google', text: `Schrijf één of twee zinnen over ${r.name}.` },
  ];
}
