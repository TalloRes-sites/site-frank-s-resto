// Data model for TalloRes Websites.
// RestaurantData comes from TalloRes (read-only on the site). SiteContent is what the restaurant edits.

export type Lang = 'nl' | 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'pl' | 'tr' | 'zh' | 'ja' | 'ar';
export type TemplateId = 'klassiek' | 'minimal' | 'bold' | 'trattoria' | 'cafe';

/** Text per language. The site's main language is always filled; other languages fall back to it. */
export type Localized = Partial<Record<Lang, string>>;

/** Every editable copy field. Not every template shows every field: see TEMPLATES[id].fields. */
export type FieldKey =
  | 'overline' | 'tagline'
  | 'aboutLabel' | 'aboutTitle' | 'aboutText' | 'chef'
  | 'menuLabel' | 'menuTitle'
  | 'reserveTitle' | 'reserveIntro'
  | 'vouchersTitle' | 'vouchersText'
  | 'practicalTitle' | 'hoursTitle' | 'locationTitle' | 'contactTitle';

export interface Photo {
  url: string;
  /** Alt text per language. Shown in the CMS as "Beschrijving voor Google en schermlezers". */
  alt: Localized;
}

export interface MenuPdf {
  id: string;
  url: string;
  /** ISO date of the upload. Shown when the description is empty. */
  uploadedAt: string;
  name: Localized;
  description: Localized;
}

export interface SiteContent {
  template: TemplateId;
  /** Palette name, one of TEMPLATES[template].palettes. */
  palette: string;
  /** languages[0] is the main language. At least one entry. */
  languages: Lang[];
  fields: Record<FieldKey, Localized>;
  /** Fields the restaurant changed. Untouched fields follow the template defaults on a template switch. */
  edited: FieldKey[];
  logoUrl?: string;
  heroPhoto?: Photo;
  aboutPhoto?: Photo;
  gallery: Photo[];
  galleryOn: boolean;
  /** Show vouchers on the site (only has effect when vouchers are enabled in TalloRes). */
  vouchersOn: boolean;
  menus: MenuPdf[];
  socials: { instagram?: string; facebook?: string };
  seo: { title: Localized; description: Localized };
}

/** Weekday index: 0 = Monday ... 6 = Sunday. Times as "HH:MM". */
export interface DayHours { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; ranges: [string, string][] }
export interface Closure { date: string /* YYYY-MM-DD */ }

/** Everything the site reads from TalloRes. Never edited in the website CMS. */
export interface RestaurantData {
  name: string;
  cuisine?: string;
  address: { street: string; postalCode: string; city: string; country: string };
  geo?: { lat: number; lng: number };
  phone: string;
  email: string;
  hours: DayHours[];
  closures: Closure[];
  company: { name: string; enterpriseNumber: string };
  /** Widget form id, as in https://widget.tallores.com/form/<id> */
  widgetFormId: string;
  vouchers: { enabled: boolean; url?: string };
  /** Max party size for online booking. Drives the group line. */
  maxOnlinePartySize?: number;
  /** Canonical site URL without trailing slash, e.g. https://www.brasserielindeboom.be */
  siteUrl: string;
}

export interface RenderOptions {
  lang: Lang;
  /** Device hint for previews only. The real site is responsive through container queries. */
  fontsHref?: string;
}
