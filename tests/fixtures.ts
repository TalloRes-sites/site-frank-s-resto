// Demo data for galleries, previews and tests. Not for production.
import { defaultContent, setField } from '../src/lib/content';
import type { RestaurantData, SiteContent, TemplateId } from '../src/lib/types';

export const DEMO_RESTAURANT: RestaurantData = {
  name: 'Brasserie Lindeboom',
  cuisine: 'Brasserie',
  address: { street: 'Ijzerenleen 21', postalCode: '2800', city: 'Mechelen', country: 'BE' },
  geo: { lat: 51.0259, lng: 4.4776 },
  phone: '015 00 00 00',
  email: 'hallo@brasserielindeboom.be',
  hours: [
    { day: 1, ranges: [['12:00', '14:00'], ['18:00', '22:00']] },
    { day: 2, ranges: [['12:00', '14:00'], ['18:00', '22:00']] },
    { day: 3, ranges: [['12:00', '14:00'], ['18:00', '22:00']] },
    { day: 4, ranges: [['12:00', '14:00'], ['18:00', '22:00']] },
    { day: 5, ranges: [['18:00', '22:30']] },
    { day: 6, ranges: [['12:00', '15:00']] },
  ],
  closures: [{ date: '2026-12-24' }, { date: '2026-12-25' }],
  company: { name: 'Brasserie Lindeboom BV', enterpriseNumber: 'BE 0123.456.789' },
  widgetFormId: 'mjrbnz296awyjw',
  vouchers: { enabled: true, url: 'https://vouchers.tallores.com/lindeboom' },
  maxOnlinePartySize: 10,
  siteUrl: 'https://lindeboom.tallores.site',
};

/** Neutral placeholder image (SVG data URL) so galleries render without network. */
export const placeholder = (label: string, bg = '#d8cfc2', fg = '#6b5a50') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="42" fill="${fg}">${label}</text></svg>`)}`;

export function demoContent(template: TemplateId = 'klassiek', opts: { photos?: boolean } = {}): SiteContent {
  let c = defaultContent(DEMO_RESTAURANT, template);
  c = setField(c, 'tagline', 'nl', 'Seizoenskeuken in het hart van Mechelen');
  c = setField(c, 'aboutTitle', 'nl', 'Een brasserie zoals het hoort');
  c = setField(c, 'aboutText', 'nl', 'Sinds 2014 koken we met wat het seizoen en de boeren uit de streek ons brengen. Eerlijke Belgische klassiekers, een goed glas wijn en tijd om te tafelen.');
  c = setField(c, 'chef', 'nl', 'Chef Jonas Maes');
  c.menus = [
    { id: 'm1', url: 'https://example.com/a-la-carte.pdf', uploadedAt: '2026-11-12', name: { nl: 'À la carte' }, description: {} },
    { id: 'm2', url: 'https://example.com/lunch.pdf', uploadedAt: '2026-11-03', name: { nl: 'Lunchmenu' }, description: { nl: 'Dinsdag tot vrijdag' } },
    { id: 'm3', url: 'https://example.com/wijn.pdf', uploadedAt: '2026-10-20', name: { nl: 'Wijnkaart' }, description: {} },
  ];
  c.socials = { instagram: '@brasserielindeboom' };
  c.seo.description = { nl: 'Seizoenskeuken en Belgische klassiekers in Mechelen. Reserveer online een tafel.' };
  if (opts.photos !== false) {
    c.heroPhoto = { url: placeholder('Hoofdfoto', '#6b5040', '#f1e6d8'), alt: { nl: 'Zaal met gedekte tafels' } };
    c.aboutPhoto = { url: placeholder('Chef'), alt: { nl: 'Chef Jonas Maes in de keuken' } };
    c.gallery = ['Gerecht', 'Terras', 'Bar', 'Wijn', 'Dessert', 'Zaal'].map((l) => ({ url: placeholder(l), alt: { nl: l } }));
  }
  return c;
}
