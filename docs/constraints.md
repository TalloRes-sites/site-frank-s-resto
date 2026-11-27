# Development constraints

Rules every change to a restaurant site must follow. The **developer** agent reads this file before
it changes anything, and the **tester** agent checks changes against it.

## Fixed rules (from the TalloRes Websites hand-off)

These are enforced by tests (`tests/render.test.ts`) and `scripts/verify-dist.ts`. Don't weaken a
test to make a change pass.

1. **Every visible text has a source**: a content field (`site/content.json`), a TalloRes value
   (`site/restaurant.json`), a fixed label (`src/lib/labels.ts`) or the privacy text
   (`src/lib/privacy.ts`). No hard-coded copy in templates.
2. **Field limits** in `FIELD_LIMITS` (`src/lib/catalog.ts`) hold for every language. Layouts must
   survive the maximum length.
3. **No photos is a valid state.** Every template has a finished variant without hero, about or
   gallery photos. The gallery is hidden without photos.
4. **Exactly one `<h1>`** per page.
5. **Long restaurant names**: the headline picks one of 3 sizes (`nameStep`), and the header name
   truncates with an ellipsis. The language picker never shrinks.
6. **No cookies, no trackers, no third-party requests on load.** The map (OpenStreetMap) loads only
   after a click. Fonts are self-hosted (@fontsource). The widget iframe is the only exception.
7. **Mobile**: name and language picker in the header, plus a sticky "book a table" bar that opens
   the widget full screen.
8. **Language switcher only with 2+ languages.** Every language lives under `/<lang>/`, and `/`
   redirects to the main language.
9. **Vouchers** show only when enabled in TalloRes *and* switched on in the CMS.
10. **Escaping**: render restaurant input with `{expr}` only. Never use `set:html` on data from
    `site/`. The only exception is JSON-LD, which escapes `<` (see `Head.astro`).
11. **Data ownership**: TalloRes writes `site/restaurant.json`, `site/content.json` and
    `site/assets/`. Code never edits them; the next TalloRes push would overwrite the change.
    Agents may only write `site/translations.json`.
12. **All five templates keep working**, including the ones this restaurant doesn't use. Run
    `npm run templates:check`.

## Project-specific constraints

<!-- TODO(TalloRes): add the constraints for custom work here (brand rules, allowed extra pages or
sections, performance budgets, accessibility level, browser support, ...). Until this section is
filled in, the developer agent only makes changes that the fixed rules above allow. -->

_None defined yet._
