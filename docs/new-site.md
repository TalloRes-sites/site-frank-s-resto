# Setting up a new restaurant site

This repository is the **template**. Every restaurant gets its own repository, created from it.

## One-time setup (this template repo)

1. In GitHub, go to **Settings → General** and tick **Template repository**.
2. Add organization-level secrets, shared by all restaurant repos:
   - `CLOUDFLARE_API_TOKEN`: token with *Workers Scripts: Edit* (plus *Workers Routes: Edit* /
     *DNS: Edit* if the pipeline also manages custom domains).
   - `CLOUDFLARE_ACCOUNT_ID`
3. Leave `CF_WORKER_NAME` unset here, so the template repo itself only builds and never deploys.

## Per restaurant (done by the TalloRes app, or by hand)

1. **Create the repo from the template**:
   ```
   POST /repos/{owner}/RestoSite/generate
   { "owner": "{owner}", "name": "site-<restaurant-slug>", "private": true }
   ```
2. **Set the repo variable** `CF_WORKER_NAME` = `site-<restaurant-slug>` (lowercase, a–z, 0–9,
   dashes). This becomes the Worker name; the Worker is created on the first deploy.
3. **Commit the data**: `site/restaurant.json`, `site/content.json` and `site/assets/**`. This
   replaces the demo restaurant. Delete the demo `site/translations.json` in the same commit; it
   belongs to the demo restaurant. See [data-contract.md](data-contract.md).
4. The push runs **Deploy**: checks, build, verify, `wrangler deploy`. The site is then live on
   `https://<CF_WORKER_NAME>.<account-subdomain>.workers.dev`.
5. **Domain**: in Cloudflare, go to **Workers → the Worker → Settings → Domains & Routes** and add
   the subdomain (e.g. `lindeboom.tallores.site`) or the restaurant's own domain as a Custom
   Domain. Cloudflare issues SSL. Set `siteUrl` in `restaurant.json` to the final URL.
6. **Translations**: open the repo in Claude Code and run the **translator** agent, then the
   **marketeer** agent. Commit `site/translations.json` through a pull request.

## Afterwards

- TalloRes commits to `site/` whenever the restaurant publishes. Each commit deploys.
- Hours or closures changed in TalloRes: commit `restaurant.json` or send the
  `tallores-data-changed` dispatch (see the data contract).
- Custom work goes through pull requests. CI runs the full suite, including all templates and the
  Playwright smoke tests.
- GitHub pauses scheduled workflows in repos without activity for 60 days. Regular TalloRes
  commits prevent that; otherwise re-enable the nightly run in the Actions tab.

## Engine updates

Restaurant repos are copies, so fixes to this template don't reach existing sites on their own. To
pull them in, add this repo as a remote in the restaurant repo and merge:

```
git remote add template https://github.com/{owner}/RestoSite.git
git fetch template && git merge template/main --allow-unrelated-histories   # first time only needs the flag
```

Conflicts can only happen in files the restaurant repo changed itself. `site/` differs by design:
keep the restaurant's version.
