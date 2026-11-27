# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The template for TalloRes restaurant websites. Each restaurant gets its own repository, created from
this one (a GitHub template repo; see `docs/new-site.md`). The TalloRes app (a separate project)
commits the restaurant's data to `site/`, and `.github/workflows/deploy.yml` builds a static Astro
site and deploys it to that restaurant's Cloudflare Worker (assets-only Worker, `wrangler.jsonc`).

In a restaurant repo, this file still applies. Restaurant-specific notes go at the end.

## Commands

```
npm run dev                          # dev server, http://localhost:4321/nl/
npm run check                        # astro check (types) + vitest
npx vitest run tests/render.test.ts  # one test file; add -t "<name>" for one test
npm run build                        # dist/
npm run verify [-- --strict]         # checks dist/; --strict also fails on missing translations
npm run templates:check [-- --screens] [ids…]   # build + verify site/ data with every template → .tmp/templates/
npm run e2e                          # Playwright smoke tests (needs a build; npx playwright install chromium once)
npm run translations:status [-- --json]
```

Point any command at other data with `SITE_DIR=<dir>` (used by `templates:check`). On Windows, keep
`--outDir` on the same drive as the repo: Astro renames files across it.

## Architecture

**Data contract (`site/`)**, specified in `docs/data-contract.md`:
- `restaurant.json` (`RestaurantData`) and `content.json` (`SiteContent`) are written by TalloRes.
  **Never edit them in code or by an agent**; the next TalloRes push overwrites them (the edits are
  denied in `.claude/settings.json`).
- `assets/`: photos and PDFs, referenced by relative paths (`assets/hero.jpg`).
- `translations.json` is the only file in `site/` that agents write.

**Flow**: `src/lib/site-data.ts` `loadSite()` validates with zod → merges the translations overlay
(TalloRes value > overlay > main-language fallback; a `source` hash marks stale entries) → adds the
required languages nl/en/fr → resolves `assets/…` to `/assets/…`. Then `src/lib/ctx.ts`
`buildCtx()` makes the view model `x` that every template receives. Pages
(`src/pages/[lang]/index.astro`, `[lang]/privacy/`) render one language each. Endpoints generate
`sitemap.xml`, `robots.txt` and `llms.txt`. The `astro.config.mjs` integration copies `site/assets`
to `dist/assets` and writes `_redirects` (`/` → main language, 301).

**Template selection happens at build time**: `astro.config.mjs` reads `content.json` and aliases
`@template` to `src/templates/<template>/Site.astro`. Only that template's fonts and CSS are bundled.
Tests import all five directly.

**Templates** are 1:1 ports of the hand-off string renderers. Inline styles come from the palette
(`TEMPLATES[id].palettes` in `src/lib/catalog.ts`) plus one small CSS string per template, using
container queries (`@container site (max-width:720px)`). They render inside `Document.astro` (head,
base CSS, page script). Shared pieces are in `src/components/`. Photos always go through `Img.astro`
(astro:assets for `site/assets` files). The page script (`SITE_SCRIPT` in `src/lib/page.ts`) handles
"today" hours, click-to-load map, widget resize messages and the mobile booking dialog.

**Logic ported unchanged from the hand-off** (`src/lib/types.ts`, `catalog.ts`, `content.ts`,
`labels.ts`, `seo.ts`, `widget.ts`) mirrors the TalloRes CMS. Keep it in sync with the TalloRes app
when you change the content model or field limits, and ask before changing either. The one
deliberate local change: `seo.ts` `absUrl()` makes `/assets/` URLs absolute.

**Escaping**: the view model holds raw strings and Astro escapes `{expr}`. Never use `set:html` on
data. JSON-LD is the exception and escapes `<` in `Head.astro`. Astro does not escape `<` inside
quoted attributes; that is safe HTML.

## Rules

`docs/constraints.md` holds the hard rules: one h1, no-photo variants, field limits, no
cookies/trackers, mobile booking bar, every template keeps working, and so on. Read it before
changing templates. The project-specific section is still to be filled in.

## Agents (`.claude/agents/`)

- **developer**: changes to the site. Follows `docs/constraints.md`.
- **tester**: runs every check, reviews the diff, adds tests. Run it after every change.
- **marketeer**: SEO/GEO audit (`src/lib/seo.ts`, `Head.astro`, `dist/` output).
- **translator**: fills `site/translations.json` from `npm run translations:status`.

## CI/CD

- `ci.yml` (PRs): check → build → `verify --strict` → `templates:check` → e2e.
- `deploy.yml` (push to main, `repository_dispatch: tallores-data-changed`, nightly, manual):
  check → build → verify (non-strict, so a data push is never blocked by a missing translation) →
  `wrangler deploy --name $CF_WORKER_NAME`. Deploy is skipped when the repo variable
  `CF_WORKER_NAME` is unset, as in this template repo.
