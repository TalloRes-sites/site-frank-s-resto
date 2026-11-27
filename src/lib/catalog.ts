import type { FieldKey, Lang, Localized, TemplateId } from './types';

/** Colours of one palette. `wp`/`ws` = primary and background passed to the reservation widget. */
export interface Palette {
  name: string;
  bg: string; surface: string; card: string; text: string; muted: string;
  accent: string; accentText: string; on: string; line: string; stripe: string;
  hero?: string; band?: string; bandFg?: string;
  wp: string; ws: string;
}

export interface TemplateDef {
  id: TemplateId;
  name: string;
  sub: string;
  /** Google Fonts families used by the template (self-host in production). */
  fonts: string[];
  /** Display font for the template picker sample. */
  displayFont: string;
  /** Copy fields this template shows, in page order. The CMS only shows these. */
  fields: FieldKey[];
  /** Restaurant-name headline steps: [short max length, mid max length]. */
  nameSteps: [number, number];
  palettes: Palette[];
}

const p = (name: string, c: Omit<Palette, 'name' | 'wp' | 'ws' | 'accentText' | 'stripe'> & Partial<Pick<Palette, 'wp' | 'ws' | 'accentText' | 'stripe'>>): Palette => ({
  name, accentText: c.accent, stripe: 'rgba(0,0,0,0.04)', wp: c.accent, ws: c.bg, ...c,
});

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  klassiek: {
    id: 'klassiek', name: 'Klassiek', sub: 'Brasserie, bistro',
    fonts: ['Playfair Display:ital,wght@0,500;0,700;1,500', 'Source Sans 3:wght@400;600'], displayFont: "'Playfair Display', serif",
    fields: ['overline', 'tagline', 'aboutLabel', 'aboutTitle', 'aboutText', 'chef', 'menuLabel', 'menuTitle', 'reserveTitle', 'reserveIntro', 'vouchersTitle', 'vouchersText', 'practicalTitle', 'hoursTitle', 'locationTitle'],
    nameSteps: [20, 30],
    palettes: [
      p('Bordeaux', { bg: '#f7f1e8', surface: '#efe5d6', card: '#fffdf9', text: '#2a1d18', muted: '#6b5a50', accent: '#7a1f2b', on: '#ffffff', line: '#e2d6c5', hero: '#3a2420' }),
      p('Bistrogroen', { bg: '#f4f1ea', surface: '#e7e4d8', card: '#fffefb', text: '#1f2a22', muted: '#586257', accent: '#1f4d3a', on: '#ffffff', line: '#dcd8cb', hero: '#1d2b23' }),
      p('Nacht', { bg: '#161414', surface: '#221f1e', card: '#1f1c1b', text: '#f3ece2', muted: '#b4aa9e', accent: '#c9a25c', accentText: '#d4b273', on: '#161414', line: '#34302d', hero: '#0b0a0a', stripe: 'rgba(255,255,255,0.05)', wp: '#8a6a2a', ws: '#f3ece2' }),
      p('Oker', { bg: '#faf5ec', surface: '#f1e6d0', card: '#fffdf8', text: '#2b2418', muted: '#6e6250', accent: '#9a5b13', accentText: '#8a5110', on: '#ffffff', line: '#e8dcc5', hero: '#3a2b18' }),
      p('Marine', { bg: '#f3f4f6', surface: '#e4e8ee', card: '#ffffff', text: '#18212e', muted: '#535e6e', accent: '#1d3557', on: '#ffffff', line: '#d7dce4', hero: '#162133' }),
    ],
  },
  minimal: {
    id: 'minimal', name: 'Minimal', sub: 'Fine dining',
    fonts: ['Cormorant Garamond:ital,wght@0,400;0,500;1,400', 'Inter:wght@400;500;600'], displayFont: "'Cormorant Garamond', serif",
    fields: ['overline', 'tagline', 'aboutLabel', 'aboutText', 'chef', 'menuTitle', 'reserveTitle', 'hoursTitle', 'locationTitle', 'contactTitle', 'vouchersTitle'],
    nameSteps: [12, 22],
    palettes: [
      p('Wit', { bg: '#ffffff', surface: '#f5f5f3', card: '#ffffff', text: '#111111', muted: '#5f5f5f', accent: '#111111', on: '#ffffff', line: '#e4e4e2', stripe: 'rgba(0,0,0,0.035)', ws: '#f5f5f3' }),
      p('Zand', { bg: '#f6f3ee', surface: '#ece6dc', card: '#fbf9f5', text: '#1c1a17', muted: '#625c53', accent: '#3d3428', on: '#ffffff', line: '#e0d9cd', stripe: 'rgba(0,0,0,0.035)' }),
      p('Zwart', { bg: '#0e0e0e', surface: '#1a1a1a', card: '#141414', text: '#f2f0eb', muted: '#a3a09a', accent: '#f2f0eb', on: '#0e0e0e', line: '#2a2a2a', stripe: 'rgba(255,255,255,0.05)', wp: '#2a2a2a', ws: '#f2f0eb' }),
      p('Salie', { bg: '#f2f4f0', surface: '#e3e8e0', card: '#fafbf9', text: '#1a211b', muted: '#56604f', accent: '#3e5641', on: '#ffffff', line: '#d6ddd2', stripe: 'rgba(0,0,0,0.035)' }),
      p('Pruim', { bg: '#f7f3f4', surface: '#ece2e5', card: '#fdfbfb', text: '#24161b', muted: '#6a5960', accent: '#5b2a3c', on: '#ffffff', line: '#e3d6da', stripe: 'rgba(0,0,0,0.035)' }),
    ],
  },
  bold: {
    id: 'bold', name: 'Bold', sub: 'Burgers, street food',
    fonts: ['Anton', 'DM Sans:wght@400;500;700'], displayFont: "'Anton', sans-serif",
    fields: ['overline', 'tagline', 'menuTitle', 'aboutTitle', 'aboutText', 'chef', 'reserveTitle', 'reserveIntro', 'hoursTitle', 'locationTitle', 'contactTitle', 'vouchersTitle'],
    nameSteps: [12, 22],
    palettes: [
      p('Mosterd', { bg: '#fff6d6', surface: '#ffe58a', card: '#fffbea', text: '#141414', muted: '#4a4433', accent: '#c8321a', on: '#ffffff', line: '#141414', band: '#141414', bandFg: '#fff6d6', stripe: 'rgba(0,0,0,0.05)' }),
      p('Roze', { bg: '#ffe9ef', surface: '#ffc6d5', card: '#fff6f8', text: '#1a1014', muted: '#5a4148', accent: '#1a1014', on: '#ffe9ef', line: '#1a1014', band: '#1a1014', bandFg: '#ffc6d5', stripe: 'rgba(0,0,0,0.05)' }),
      p('Kobalt', { bg: '#e9f0ff', surface: '#c7d8ff', card: '#f7f9ff', text: '#0b1533', muted: '#3c4766', accent: '#2347d6', on: '#ffffff', line: '#0b1533', band: '#2347d6', bandFg: '#ffffff', stripe: 'rgba(0,0,0,0.05)' }),
      p('Zwart', { bg: '#121212', surface: '#1f1f1f', card: '#1a1a1a', text: '#ffffff', muted: '#bdbdbd', accent: '#ffd23f', on: '#121212', line: '#ffffff', band: '#ffd23f', bandFg: '#121212', stripe: 'rgba(255,255,255,0.06)', wp: '#121212', ws: '#fff8db' }),
      p('Groen', { bg: '#eef7e8', surface: '#cfeabf', card: '#f8fcf5', text: '#10200b', muted: '#3f5236', accent: '#1f7a3a', on: '#ffffff', line: '#10200b', band: '#10200b', bandFg: '#cfeabf', stripe: 'rgba(0,0,0,0.05)' }),
    ],
  },
  trattoria: {
    id: 'trattoria', name: 'Trattoria', sub: 'Italiaans, mediterraan',
    fonts: ['DM Serif Display:ital@0;1', 'Nunito Sans:wght@400;600;700'], displayFont: "'DM Serif Display', serif",
    fields: ['overline', 'tagline', 'aboutLabel', 'aboutTitle', 'aboutText', 'chef', 'menuTitle', 'reserveTitle', 'reserveIntro', 'hoursTitle', 'locationTitle', 'vouchersTitle'],
    nameSteps: [16, 26],
    palettes: [
      p('Terracotta', { bg: '#fbf4ec', surface: '#f3e1cf', card: '#fffaf4', text: '#2e1c12', muted: '#6f5747', accent: '#b4532a', accentText: '#a34a24', on: '#ffffff', line: '#ead8c4' }),
      p('Olijf', { bg: '#f6f4ea', surface: '#e6e3cc', card: '#fcfbf5', text: '#23241a', muted: '#5d5f4b', accent: '#5c6b2e', accentText: '#535f29', on: '#ffffff', line: '#dedbc3' }),
      p('Zee', { bg: '#f2f7f8', surface: '#d9e9ec', card: '#fbfdfd', text: '#10262c', muted: '#4b6168', accent: '#1c6e7d', accentText: '#18606d', on: '#ffffff', line: '#cfe0e4' }),
      p('Citroen', { bg: '#fffbea', surface: '#fbefb6', card: '#fffdf5', text: '#2a2510', muted: '#5f5838', accent: '#8a6d00', accentText: '#735b00', on: '#ffffff', line: '#f0e4a8' }),
      p('Wijn', { bg: '#f8f1f1', surface: '#ecdada', card: '#fdf9f9', text: '#2b1416', muted: '#6b5052', accent: '#8c2633', on: '#ffffff', line: '#e4cfcf' }),
    ],
  },
  cafe: {
    id: 'cafe', name: 'Café', sub: 'Koffie, lunch, brunch',
    fonts: ['Fraunces:opsz,wght@9..144,500;9..144,600', 'Outfit:wght@400;500;600'], displayFont: "'Fraunces', serif",
    fields: ['overline', 'tagline', 'aboutTitle', 'aboutText', 'chef', 'menuTitle', 'reserveTitle', 'reserveIntro', 'hoursTitle', 'locationTitle', 'vouchersTitle'],
    nameSteps: [16, 26],
    palettes: [
      p('Melk', { bg: '#fbf7f2', surface: '#f0e6da', card: '#ffffff', text: '#2c2119', muted: '#6c5d52', accent: '#6f4e37', on: '#ffffff', line: '#e8ddd0' }),
      p('Munt', { bg: '#f1f8f4', surface: '#d8eee2', card: '#ffffff', text: '#12261b', muted: '#4a6152', accent: '#2e7d5b', accentText: '#276b4e', on: '#ffffff', line: '#d3e6db' }),
      p('Perzik', { bg: '#fff4ee', surface: '#ffdfcf', card: '#ffffff', text: '#2d1a12', muted: '#6b5046', accent: '#a8452a', on: '#ffffff', line: '#f3dacd' }),
      p('Lavendel', { bg: '#f5f3fb', surface: '#e3ddf5', card: '#ffffff', text: '#1d1830', muted: '#57506e', accent: '#5a47a8', on: '#ffffff', line: '#e0dbf0' }),
      p('Espresso', { bg: '#1d1714', surface: '#2a221d', card: '#251e1a', text: '#f5ede4', muted: '#bfae9f', accent: '#e7b98a', on: '#1d1714', line: '#3a302a', stripe: 'rgba(255,255,255,0.05)', wp: '#6f4e37', ws: '#f5ede4' }),
    ],
  },
};

export const TEMPLATE_ORDER: TemplateId[] = ['klassiek', 'minimal', 'bold', 'trattoria', 'cafe'];

export function palette(template: TemplateId, name: string): Palette {
  const t = TEMPLATES[template];
  return t.palettes.find((x) => x.name === name) ?? t.palettes[0];
}

/** Max characters per field. The CMS shows a counter and blocks input at the limit. */
export const FIELD_LIMITS: Record<FieldKey, number> = {
  overline: 40, tagline: 70,
  aboutLabel: 24, aboutTitle: 50, aboutText: 600, chef: 40,
  menuLabel: 24, menuTitle: 50,
  reserveTitle: 50, reserveIntro: 200,
  vouchersTitle: 50, vouchersText: 120,
  practicalTitle: 50, hoursTitle: 30, locationTitle: 30, contactTitle: 30,
};
export const PHOTO_ALT_LIMIT = 125;
export const PDF_NAME_LIMIT = 30;
export const PDF_DESCRIPTION_LIMIT = 40;
export const GALLERY_MAX = 9;
export const RESTAURANT_NAME_MAX = 60;

export const FIELD_LABELS: Record<FieldKey, string> = {
  overline: 'Bovenschrift', tagline: 'Tagline',
  aboutLabel: 'Label', aboutTitle: 'Titel', aboutText: 'Tekst', chef: 'Chef of team',
  menuLabel: 'Label', menuTitle: 'Titel',
  reserveTitle: 'Titel', reserveIntro: 'Intro',
  vouchersTitle: 'Titel', vouchersText: 'Tekst',
  practicalTitle: 'Sectietitel', hoursTitle: 'Titel openingsuren', locationTitle: 'Titel adres', contactTitle: 'Titel contact',
};
export const MULTILINE_FIELDS: FieldKey[] = ['aboutText', 'reserveIntro'];

/** Languages a restaurant can pick from, in list order. */
export const LANGUAGES: { code: Lang; name: string }[] = [
  { code: 'nl', name: 'Nederlands' }, { code: 'fr', name: 'Frans' }, { code: 'en', name: 'Engels' },
  { code: 'de', name: 'Duits' }, { code: 'es', name: 'Spaans' }, { code: 'it', name: 'Italiaans' },
  { code: 'pt', name: 'Portugees' }, { code: 'pl', name: 'Pools' }, { code: 'tr', name: 'Turks' },
  { code: 'zh', name: 'Chinees' }, { code: 'ja', name: 'Japans' }, { code: 'ar', name: 'Arabisch' },
];
export const languageName = (code: Lang) => LANGUAGES.find((l) => l.code === code)?.name ?? code.toUpperCase();

type Defaults = Partial<Record<FieldKey, Localized>>;
const COMMON_DEFAULTS: Defaults = {
  aboutLabel: { nl: 'Over ons', fr: 'À propos', en: 'About us' },
  menuLabel: { nl: 'Eten en drinken', fr: 'À table', en: 'Food and drinks' },
  menuTitle: { nl: 'Menukaart', fr: 'La carte', en: 'Menu' },
  reserveTitle: { nl: 'Reserveer een tafel', fr: 'Réservez une table', en: 'Book a table' },
  reserveIntro: { nl: 'Kies je dag en uur, je krijgt meteen een bevestiging.', fr: "Choisissez le jour et l'heure, vous recevez tout de suite une confirmation.", en: 'Pick a day and time, you get a confirmation straight away.' },
  vouchersTitle: { nl: 'Geef een avond bij ons cadeau', fr: 'Offrez une soirée chez nous', en: 'Give an evening with us' },
  vouchersText: { nl: 'Cadeaubonnen, meteen in de mailbox.', fr: 'Bons cadeaux, directement par e-mail.', en: 'Gift vouchers, straight to the inbox.' },
  practicalTitle: { nl: 'Praktisch', fr: 'Infos pratiques', en: 'Practical' },
  hoursTitle: { nl: 'Openingsuren', fr: "Heures d'ouverture", en: 'Opening hours' },
  locationTitle: { nl: 'Adres en contact', fr: 'Adresse et contact', en: 'Address and contact' },
  contactTitle: { nl: 'Contact', fr: 'Contact', en: 'Contact' },
};
const TEMPLATE_DEFAULTS: Record<TemplateId, Defaults> = {
  klassiek: {},
  minimal: {
    menuTitle: { nl: 'Menu', fr: 'Menu', en: 'Menu' },
    reserveTitle: { nl: 'Reserveren', fr: 'Réserver', en: 'Book' },
    locationTitle: { nl: 'Adres', fr: 'Adresse', en: 'Address' },
    vouchersTitle: { nl: 'Schenk een avond aan tafel.', fr: 'Offrez une soirée à table.', en: 'Give an evening at our table.' },
  },
  bold: {
    menuTitle: { nl: 'De kaart', fr: 'La carte', en: 'The menu' },
    reserveTitle: { nl: 'Tafel nodig?', fr: "Besoin d'une table ?", en: 'Need a table?' },
    reserveIntro: { nl: 'Reserveer hieronder. Walk-ins zijn welkom zolang er plek is.', fr: 'Réservez ci-dessous. Sans réservation, bienvenue tant qu’il y a de la place.', en: 'Book below. Walk-ins are welcome while there is room.' },
    hoursTitle: { nl: 'Open', fr: 'Ouvert', en: 'Open' },
    locationTitle: { nl: 'Waar', fr: 'Où', en: 'Where' },
    contactTitle: { nl: 'Bel of volg', fr: 'Appelez ou suivez', en: 'Call or follow' },
    vouchersTitle: { nl: 'Cadeau doen?', fr: 'Un cadeau ?', en: 'Treat someone?' },
  },
  trattoria: {
    aboutLabel: { nl: 'La famiglia', fr: 'La famiglia', en: 'La famiglia' },
    menuTitle: { nl: 'Il menu', fr: 'Il menu', en: 'Il menu' },
    reserveTitle: { nl: 'Prenota un tavolo', fr: 'Prenota un tavolo', en: 'Prenota un tavolo' },
    hoursTitle: { nl: 'Orari', fr: 'Orari', en: 'Orari' },
    locationTitle: { nl: 'Dove siamo', fr: 'Dove siamo', en: 'Dove siamo' },
    vouchersTitle: { nl: 'Un regalo? Geef een avond cadeau', fr: 'Un regalo ? Offrez une soirée', en: 'Un regalo? Give an evening' },
  },
  cafe: {
    menuTitle: { nl: 'Wat we schenken en bakken', fr: 'Ce que nous servons', en: 'What we pour and bake' },
    reserveTitle: { nl: 'Kom brunchen', fr: 'Venez bruncher', en: 'Come for brunch' },
    reserveIntro: { nl: 'Reserveer je plek. Voor gewoon een koffie hoef je niet te reserveren.', fr: 'Réservez votre place. Pour un simple café, pas besoin de réserver.', en: 'Book your spot. For just a coffee, no need to book.' },
    locationTitle: { nl: 'Langskomen', fr: 'Passez nous voir', en: 'Visit us' },
    vouchersTitle: { nl: 'Trakteer iemand.', fr: 'Faites plaisir.', en: 'Treat someone.' },
  },
};

/** Template default for a field, all languages we ship defaults for. Empty object = no default. */
export function templateDefault(template: TemplateId, field: FieldKey): Localized {
  return { ...(TEMPLATE_DEFAULTS[template][field] ?? COMMON_DEFAULTS[field] ?? {}) };
}
