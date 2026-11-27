# Data contract: TalloRes app → restaurant site repo

The TalloRes app publishes a restaurant website by committing files to the `site/` folder of that
restaurant's repository (on `main`). Each commit triggers `.github/workflows/deploy.yml`, which
builds and deploys the site. The schemas are enforced at build time by `src/lib/site-data.ts`; an
invalid file fails the build with the failing path (e.g. `hours.0.day: Too big`).

| Path | Owner | Contents |
|---|---|---|
| `site/restaurant.json` | TalloRes | `RestaurantData`: facts from TalloRes, never edited on the site |
| `site/content.json` | TalloRes (website CMS) | `SiteContent`: template, palette, languages, copy, photos, menus, SEO |
| `site/assets/**` | TalloRes | Uploaded photos (jpg/png/webp/avif), logo, menu PDFs |
| `site/translations.json` | translator agent | Translations overlay. **TalloRes must not write or delete it.** |

The TypeScript types are in [`src/lib/types.ts`](../src/lib/types.ts). This page lists the
practical rules.

## `restaurant.json` (RestaurantData)

```jsonc
{
  "name": "Brasserie Lindeboom",
  "cuisine": "Brasserie",                       // optional
  "address": { "street": "Ijzerenleen 21", "postalCode": "2800", "city": "Mechelen", "country": "BE" },
  "geo": { "lat": 51.0259, "lng": 4.4776 },     // optional; without it the map is hidden
  "phone": "015 00 00 00",
  "email": "hallo@brasserielindeboom.be",
  "hours": [ { "day": 1, "ranges": [["12:00", "14:00"], ["18:00", "22:00"]] } ],  // day 0 = Monday
  "closures": [ { "date": "2026-12-24" } ],     // past dates are ignored; deploy runs nightly
  "company": { "name": "Brasserie Lindeboom BV", "enterpriseNumber": "BE 0123.456.789" },
  "widgetFormId": "mjrbnz296awyjw",             // https://widget.tallores.com/form/<id>
  "vouchers": { "enabled": true, "url": "https://vouchers.tallores.com/lindeboom" },
  "maxOnlinePartySize": 10,                     // optional; drives "More than 10 people? Call us"
  "siteUrl": "https://lindeboom.tallores.site"  // canonical URL, no trailing slash
}
```

`siteUrl` becomes the canonical URL, so change it when the restaurant connects its own domain.

## `content.json` (SiteContent)

Exactly what the CMS stores (`defaultContent()` in `src/lib/content.ts` creates the first version):

- `template`: `klassiek` | `minimal` | `bold` | `trattoria` | `cafe`. `palette` is a palette name
  of that template; an unknown name falls back to the first palette.
- `languages`: `languages[0]` is the main language. The site always also publishes **nl, en and
  fr**; the translator agent fills those.
- `fields`: copy per field and language (`{ "tagline": { "nl": "…" } }`). Limits are in
  `FIELD_LIMITS` (`src/lib/catalog.ts`).
- `heroPhoto`, `aboutPhoto`, `gallery[]`: `{ "url": "assets/hero.jpg", "alt": { "nl": "…" } }`.
- `menus[]`: `{ "id", "url": "assets/lunch.pdf", "uploadedAt": "2026-11-03", "name": {…}, "description": {…} }`.
- `logoUrl`, `socials` (`instagram` as `@handle` or a URL, `facebook`), `seo.title`, `seo.description`,
  `galleryOn`, `vouchersOn`, `edited`.

### Asset URLs

- **Relative paths** (`assets/hero.jpg`) refer to `site/assets/hero.jpg`. Photos are optimized at
  build time (WebP, 480/960/1600 px srcset), and all files are also published unchanged under
  `/assets/` (menu PDFs, `og:image`).
- **Absolute URLs** (`https://…`) are used as-is, without optimization. Prefer committing the file.
- Upload originals of at least 1600 px wide for hero photos. Keep file names stable: translations of
  alt texts are keyed by the `url` value.

## Triggering a rebuild without a commit

When data that only lives in TalloRes changes (hours, closures, vouchers), either commit the new
`restaurant.json` (preferred: the repo history then shows what changed) or send:

```
POST https://api.github.com/repos/{owner}/{repo}/dispatches
{ "event_type": "tallores-data-changed" }
```

The site also rebuilds every night, so past closures drop off.

## What TalloRes must not do

- Write or delete `site/translations.json`.
- Commit anything outside `site/`. Code changes go through pull requests.
- Rely on fields that aren't in the schema: unknown fields are ignored.
