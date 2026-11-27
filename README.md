# Your restaurant website

This repository holds your restaurant's website. It was created from the TalloRes website template
and is published automatically: you don't need to write code to keep it up to date.

- One page per language (`/nl/`, `/en/`, `/fr/`, …), always at least Dutch, English and French
- 5 designs (templates) with 5 colour palettes each: klassiek, minimal, bold, trattoria, cafe
- Online reservations, menus (PDF), gift vouchers, opening hours with closing days, a map
- Found by search engines and AI assistants (structured data, sitemap, `llms.txt`)
- No cookies and no trackers, so no cookie banner is needed

## How your website is updated

You manage your website in the **TalloRes app**. When you publish there, TalloRes saves your data
in the `site/` folder of this repository, and the site is rebuilt and put online within a few
minutes. The site also rebuilds every night, so past closing days disappear on their own.

| What you want to change | Where |
|---|---|
| Texts, photos, menus, logo, social links | TalloRes app, website editor |
| Design (template) and colours (palette) | TalloRes app, website editor |
| Languages of the site | TalloRes app, website editor |
| Name, address, phone, opening hours, closing days, vouchers | TalloRes app, restaurant settings |
| Translations into other languages | `site/translations.json` (see [Translations](#translations)) |
| Anything else (layout, extra sections, …) | Code changes in this repository (see [Customizing](#customizing-the-site)) |

**Don't edit `site/restaurant.json`, `site/content.json` or `site/assets/` by hand.** TalloRes
overwrites them on the next publish, so the change would be lost. Change them in the TalloRes app.

Tips for good results:
- Hero photos look best at least 1600 px wide. Photos are resized and compressed automatically.
- Every text field has a maximum length; the editor shows it. The designs are built to fit it.
- The site works without photos too: every design has a finished version without them.

## Where your site is online

- Your address is set in `siteUrl` in TalloRes, for example `https://yourname.tallores.site`.
- Before a domain is connected, the site runs at `https://<worker-name>.<account>.workers.dev`.
- To use your own domain, add it in Cloudflare under **Workers → your Worker → Settings → Domains &
  Routes**, then change the website address in TalloRes. See [docs/new-site.md](docs/new-site.md).

Every build and deploy is listed in the **Actions** tab of this repository. A red cross means the
site was not updated; the previous version stays online.

## Translations

Your texts are written in your main language. The site always also appears in Dutch, English and
French, and any other language you picked. Missing translations fall back to the main language,
so the site never shows empty text.

Translations live in `site/translations.json`, the only file in `site/` you (or an agent) may edit.
The easiest way to fill it is the **translator** agent in Claude Code (see below). Text you change
later in TalloRes is marked as outdated, and the translator updates it on its next run.

To see what is missing:

```
npm run translations:status
```

## Viewing the site on your computer

You need [Node.js](https://nodejs.org/) 22 or newer and a copy (clone) of this repository.

```
npm install
npm run dev            # open http://localhost:4321/nl/
```

The page reloads as you change files. Stop the server with Ctrl+C.

## Customizing the site

The site is built with [Astro](https://astro.build/). You can change it yourself, ask a developer,
or use Claude Code with the agents included in this repository.

### With Claude Code

Open this folder in [Claude Code](https://claude.com/claude-code) and describe what you want, for
example "add a section about our terrace below the menus". The agents know the rules of this site:

| Agent | Use it to |
|---|---|
| `developer` | Change the design or add features, following [docs/constraints.md](docs/constraints.md) |
| `tester` | Check a change for problems before it goes online (run it after every change) |
| `marketeer` | Improve how the site is found on Google and by AI assistants |
| `translator` | Fill in missing translations in `site/translations.json` |

### Rules for every change

[docs/constraints.md](docs/constraints.md) lists the rules every change must follow, such as: all
text comes from TalloRes or the translations, no cookies or trackers, the site must work without
photos, and all five templates must keep working (so you can switch design later).

### Agents and rules are maintained by TalloRes

The agents (`.claude/agents/`) and the rules in [docs/constraints.md](docs/constraints.md) are
maintained by TalloRes. They are updated before each publish, so they always match the current
version of the website engine and the TalloRes app.

**Don't change these files.** Your changes are overwritten on the next publish. If an agent or rule
doesn't fit your restaurant, ask TalloRes to change it.

To give Claude Code your own instructions (brand colours, extra pages, things to avoid, …), add them
at the end of [CLAUDE.md](CLAUDE.md), under a heading for your restaurant. The agents read that
file too.

### Where things are

| Path | Contents |
|---|---|
| `site/` | Your data from TalloRes, plus `translations.json` |
| `src/templates/<name>/` | The five designs |
| `src/components/` | Shared parts: header, map, booking widget, mobile booking bar, privacy page |
| `src/lib/labels.ts` | Fixed labels such as "Book a table", in every language |
| `src/lib/catalog.ts` | Templates, colour palettes and field limits |
| `docs/designs/` | Screenshots of each design |

### Checking a change

```
npm run check                    # types and tests
npm run build                    # builds the site into dist/
npm run verify                   # checks the built site
npm run templates:check          # builds your data with all five templates
npm run e2e                      # browser tests (first run: npx playwright install chromium)
```

### Publishing a change

Make code changes on a branch and open a **pull request**. GitHub runs all checks on it. When you
merge the pull request into `main`, the site is rebuilt and published. Pushing directly to `main`
publishes immediately, without the pull request checks.

## Updates from the template

This repository is a copy of the TalloRes template, so template improvements don't arrive on their
own. To pull them in:

```
git remote add template https://github.com/<owner>/RestoSite.git    # once
git fetch template
git merge template/main --allow-unrelated-histories                  # the flag is only needed the first time
```

Conflicts only appear in files you changed yourself. In `site/`, always keep your own version.
Open the merge as a pull request so the checks run before it goes online.

## More information

- [docs/data-contract.md](docs/data-contract.md): what TalloRes writes to `site/`, and the format
- [docs/constraints.md](docs/constraints.md): rules for every change
- [docs/new-site.md](docs/new-site.md): how the repository, Cloudflare and domains are set up
- [CLAUDE.md](CLAUDE.md): technical overview of the code, for developers and Claude Code
