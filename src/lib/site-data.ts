// Loads the data contract from site/ (see docs/data-contract.md):
//   restaurant.json   RestaurantData, written by TalloRes
//   content.json      SiteContent, written by the TalloRes website CMS
//   translations.json overlay maintained by the translator agent (never written by TalloRes)
// and returns content ready to render: overlay merged, required languages added, asset URLs resolved.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { LANGUAGES, TEMPLATE_ORDER, TEMPLATES, FIELD_LIMITS } from './catalog';
import { photosInUse } from './content';
import type { FieldKey, Lang, Localized, Photo, RestaurantData, SiteContent } from './types';

/** Every site is published in at least these languages. Missing copy is filled by the translations overlay. */
export const REQUIRED_LANGS: Lang[] = ['nl', 'en', 'fr'];

// ---------- schemas (mirror types.ts) ----------

const lang = z.enum(LANGUAGES.map((l) => l.code) as [Lang, ...Lang[]]);
const localizedSchema = z.partialRecord(lang, z.string());
const time = z.string().regex(/^\d{2}:\d{2}$/, 'expected HH:MM');
const fieldKey = z.enum(Object.keys(FIELD_LIMITS) as [FieldKey, ...FieldKey[]]);
const photo = z.object({ url: z.string().min(1), alt: localizedSchema });

export const restaurantSchema = z.object({
  name: z.string().min(1),
  cuisine: z.string().optional(),
  address: z.object({ street: z.string(), postalCode: z.string(), city: z.string(), country: z.string() }),
  geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
  phone: z.string(),
  email: z.string(),
  hours: z.array(z.object({ day: z.number().int().min(0).max(6), ranges: z.array(z.tuple([time, time])) })),
  closures: z.array(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD') })),
  company: z.object({ name: z.string(), enterpriseNumber: z.string() }),
  widgetFormId: z.string().min(1),
  vouchers: z.object({ enabled: z.boolean(), url: z.string().optional() }),
  maxOnlinePartySize: z.number().int().positive().optional(),
  siteUrl: z.url().refine((u) => !u.endsWith('/'), 'siteUrl must not end with /'),
});

export const contentSchema = z.object({
  template: z.enum(TEMPLATE_ORDER as [string, ...string[]]),
  palette: z.string(),
  languages: z.array(lang).min(1),
  fields: z.partialRecord(fieldKey, localizedSchema),
  edited: z.array(fieldKey),
  logoUrl: z.string().optional(),
  heroPhoto: photo.optional(),
  aboutPhoto: photo.optional(),
  gallery: z.array(photo),
  galleryOn: z.boolean(),
  vouchersOn: z.boolean(),
  menus: z.array(z.object({ id: z.string(), url: z.string(), uploadedAt: z.string(), name: localizedSchema, description: localizedSchema })),
  socials: z.object({ instagram: z.string().optional(), facebook: z.string().optional() }),
  seo: z.object({ title: localizedSchema, description: localizedSchema }),
});

const entry = z.object({ text: z.string(), source: z.string() });
const entries = z.partialRecord(lang, entry);
export const translationsSchema = z.object({
  fields: z.partialRecord(fieldKey, entries).default({}),
  photos: z.record(z.string(), entries).default({}),
  menus: z.record(z.string(), z.object({ name: entries.optional(), description: entries.optional() })).default({}),
  seo: z.object({ title: entries.optional(), description: entries.optional() }).default({}),
});

export type Translations = z.infer<typeof translationsSchema>;
type Entries = z.infer<typeof entries>;

// ---------- overlay merge ----------

/** Fingerprint of the main-language text a translation was made from. Changes when TalloRes changes that text. */
export const sourceHash = (s: string) => createHash('sha1').update(s.trim()).digest('hex').slice(0, 12);

export interface TranslationIssue {
  kind: 'missing' | 'stale';
  /** Path in translations.json, e.g. "fields.tagline", "photos.assets/hero.jpg", "menus.m1.name", "seo.title". */
  path: string;
  lang: Lang;
  /** Main-language text to translate, and its hash to store as `source`. */
  source: string;
  sourceHash: string;
  /** Character limit for the translated text, when the field has one. */
  limit?: number;
}

interface MergeCtx { main: Lang; others: Lang[]; issues: TranslationIssue[] }

/**
 * Merge one localized value. Priority per language: TalloRes value, then overlay, then nothing
 * (rendering falls back to the main language). `required` = report missing translations for it.
 */
function merge(m: MergeCtx, v: Localized, o: Entries | undefined, path: string, required: boolean, limit?: number): Localized {
  const out: Localized = { ...v };
  const src = (v[m.main] ?? '').trim();
  if (!src) return out;
  const hash = sourceHash(src);
  for (const l of m.others) {
    if ((v[l] ?? '').trim()) continue;
    const e = o?.[l];
    if (e?.text.trim()) {
      out[l] = limit ? e.text.slice(0, limit) : e.text;
      if (required && e.source !== hash) m.issues.push({ kind: 'stale', path, lang: l, source: src, sourceHash: hash, limit });
    } else if (required) {
      m.issues.push({ kind: 'missing', path, lang: l, source: src, sourceHash: hash, limit });
    }
  }
  return out;
}

/** Published languages: the restaurant's own (main first) plus every required language. */
export const publishedLanguages = (c: Pick<SiteContent, 'languages'>, required = REQUIRED_LANGS): Lang[] =>
  [...c.languages, ...required.filter((l) => !c.languages.includes(l))];

export function applyTranslations(c: SiteContent, tr: Translations, required = REQUIRED_LANGS): { content: SiteContent; issues: TranslationIssue[] } {
  const languages = publishedLanguages(c, required);
  const m: MergeCtx = { main: languages[0], others: languages.slice(1), issues: [] };
  const shown = new Set<FieldKey>(TEMPLATES[c.template].fields);
  const inUse = new Set(photosInUse(c).map((p) => p.photo.url));
  const fields = Object.fromEntries((Object.keys(FIELD_LIMITS) as FieldKey[]).map((f) =>
    [f, merge(m, c.fields[f] ?? {}, tr.fields[f], `fields.${f}`, shown.has(f), FIELD_LIMITS[f])])) as Record<FieldKey, Localized>;
  const ph = (p?: Photo): Photo | undefined => p && { ...p, alt: merge(m, p.alt, tr.photos[p.url], `photos.${p.url}`, inUse.has(p.url), 125) };
  const content: SiteContent = {
    ...c,
    languages,
    fields,
    heroPhoto: ph(c.heroPhoto),
    aboutPhoto: ph(c.aboutPhoto),
    gallery: c.gallery.map((p) => ph(p)!),
    menus: c.menus.map((x) => ({
      ...x,
      name: merge(m, x.name, tr.menus[x.id]?.name, `menus.${x.id}.name`, true, 30),
      description: merge(m, x.description, tr.menus[x.id]?.description, `menus.${x.id}.description`, true, 40),
    })),
    seo: {
      title: merge(m, c.seo.title, tr.seo.title, 'seo.title', true),
      description: merge(m, c.seo.description, tr.seo.description, 'seo.description', true),
    },
  };
  return { content, issues: m.issues };
}

// ---------- assets ----------

/**
 * content.json may reference files in site/assets with a relative path ("assets/hero.jpg").
 * Those are served from /assets/ on the site. Absolute and data: URLs pass through.
 */
export const resolveAsset = (url: string) => (/^(https?:|data:|\/)/.test(url) ? url : '/' + url.replace(/^\.?\//, ''));

function resolveAssets(c: SiteContent): SiteContent {
  const ph = (p?: Photo) => p && { ...p, url: resolveAsset(p.url) };
  return {
    ...c,
    logoUrl: c.logoUrl ? resolveAsset(c.logoUrl) : undefined,
    heroPhoto: ph(c.heroPhoto),
    aboutPhoto: ph(c.aboutPhoto),
    gallery: c.gallery.map((p) => ph(p)!),
    menus: c.menus.map((x) => ({ ...x, url: resolveAsset(x.url) })),
  };
}

// ---------- loader ----------

export interface SiteData {
  restaurant: RestaurantData;
  /** Content as rendered: overlay merged, all published languages, asset URLs resolved. */
  content: SiteContent;
  /** content.json exactly as TalloRes wrote it. */
  source: SiteContent;
  translations: Translations;
  issues: TranslationIssue[];
  dir: string;
}

function readJson<T>(file: string, schema: z.ZodType<T>, fallback?: T): T {
  if (!existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing ${file}. See docs/data-contract.md.`);
  }
  const parsed = schema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid ${file}:\n${lines.join('\n')}`);
  }
  return parsed.data;
}

export const siteDir = () => resolve(process.env.SITE_DIR ?? 'site');

const cache = new Map<string, SiteData>();

export function loadSite(dir = siteDir()): SiteData {
  const hit = cache.get(dir);
  if (hit) return hit;
  const restaurant = readJson(join(dir, 'restaurant.json'), restaurantSchema) as RestaurantData;
  const source = readJson(join(dir, 'content.json'), contentSchema) as SiteContent;
  const translations = readJson(join(dir, 'translations.json'), translationsSchema, translationsSchema.parse({}));
  const { content, issues } = applyTranslations(source, translations);
  const data: SiteData = { restaurant, content: resolveAssets(content), source, translations, issues, dir };
  cache.set(dir, data);
  return data;
}
