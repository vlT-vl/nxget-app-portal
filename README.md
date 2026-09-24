<p align="center">
  <img src="src/res/nxget-logo.svg" alt="nxget" width="320" />
</p>

<p align="center">
  Open portal for cross-platform software — Windows · macOS · Linux<br/>
  <sub>Frontend React · Build Vite · Deploy GitHub Pages</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0--R240926-b23b3f?style=flat-square" alt="version"/>
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="react"/>
  <img src="https://img.shields.io/badge/vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="vite"/>
  <img src="https://img.shields.io/badge/deploy-GitHub%20Pages-black?style=flat-square&logo=github" alt="deploy"/>
  <img src="https://img.shields.io/badge/license-proprietary-critical?style=flat-square" alt="license"/>
</p>

---

## Overview

**nxget** is a frontend-only web app that works as a showcase for cross-platform software: a single hub to discover applications available on Windows, macOS and Linux, and reach the right download for your platform and CPU architecture.

There is no application backend. The catalog itself lives in a separate public registry, [`nxget.packages`](https://github.com/vlT-vl/nxget.packages) — one hand-written YAML manifest per app. The portal fetches this registry live in the browser; where a manifest names a GitHub `repo`, the download links and the current version are resolved live from that repository's latest GitHub Release, and where it does not (closed-source apps) the manifest itself carries the fixed download links and the current `version`. Nothing about the catalog or its downloads is pre-computed, bundled or hardcoded into the portal, so both stay current without a new deploy.

A dedicated cross-platform CLI, able to install the same catalog's apps and content straight from the terminal, is planned as the next step — see the in-app **CLI** page for the roadmap.

---

## Features

| Section | Description |
|---|---|
| **Home** | Hero search and illustration — the catalog artwork (`CatalogTower`) is inlined and animated here: each building block of the drawing slides/fades into place in sequence, then the rain-thread beams and the glowing box lids keep a soft idle pulse; below it, a "What nxget is" section — a `DownloadFlow` diagram (remote registry → portal → download) beside a short paragraph linking to the "Why nxget" page for the details; then a "Featured" grid (5 to 8 smaller cards, a category-tinted border and platform icons that the regular catalog cards don't have) prioritizing whichever apps the registry's last two commits touched, topped up with other catalog apps to a minimum of five |
| **Apps** | Full catalog in a wide grid (up to 5 cards per row on large screens), free-text search, a platform filter (Windows/macOS/Linux) and a category combobox (one color-coded pill per category actually in the catalog, next to the platform filter), with the same animated `CatalogTower` illustration used in the Home hero, fixed to the viewport on the left, partly behind the cards (dimmed to a faint silhouette so it doesn't compete with the grid, and — only on this page — replaying its whole entrance+idle sequence from scratch every 12 seconds instead of playing once). The list is paginated (`PAGE_SIZE` in `AppsView.jsx`, currently 15 apps per page): a dot pager where the current page is an animated oval, with an animated "Page X of Y" label below, shown only when there is more than one page. Search, both filters and current page are kept in memory while you open an app and come back (scroll position included), but not across a browser reload |
| **App detail** | Per-app page with live-resolved download buttons (one per platform *and* architecture when both exist), an "Information" card (extended bilingual description, publisher, current version, category/platform pills, app id) and, on wide screens next to it, a "Version history" card (up to 10 recent releases pulled from the same GitHub call, no extra request; only for apps with a `repo`). The current version comes from the latest release when the manifest has a `repo`, otherwise from the manifest's own `version` (with per-file overrides listed underneath when a platform differs). Also: compact related-apps cards from the same category, "View on GitHub" / "Visit website" links when available, and a `nxget install <id>` command box (CLI not out yet). A **License** button opens the software's license text, fetched from GitHub, and only appears when a license was actually retrieved. Apps in the `vlT Software` category (or marked `access: voucher`) show a disclaimer and locked download buttons until a valid download voucher is entered |
| **Why nxget** | Value-proposition grid (cross-platform, hand-picked, official sources, open catalog, always up to date, CLI coming soon), a "How it works" walkthrough from the registry to the download button, and a "Details that matter" section of six icon cards (app details and version history, license button, search and platform filter, similar apps, official site/repo links, language and theme) |
| **CLI** | Roadmap page for the planned command-line client: what `install` / `update` will do, a preview of the planned commands, a "Why a CLI" section, how it will reuse the same registry and release resolution as the portal, and a status board (registry and portal available, CLI planned) |
| **About** | Project origin story (bilingual, loaded from an external text file), with a credit link to Keivan Beigi's blog, an "INFO" pill that opens the same version/build/stack modal as the footer, and a brand card above the pills with the animated vlT logo (a link to lorenzoveronesi.it) and the copyright line (the animation starts when the card scrolls into view) |

### Interface

- Light/dark theme with preference saved in `localStorage` (key `vlt-theme`), following the system preference by default
- IT/EN language switcher in the navbar with preference saved in `localStorage` (key `vlt-lang`) — **Italian by default**
- `nxget` wordmark as an inline SVG (`NxgetLogo`), theme-aware via a CSS custom property so it stays legible on both themes independent of the OS preference
- Category and platform pills color-coded (category pills also on the catalog cards): each platform has a fixed hue (Windows blue, macOS violet, Linux amber), every other tag (category) gets a hue derived from a hash of its text (the palette has no red: red with the gradient is reserved to the `vlT Software` category) — same formula also used for the catalog card logo fallback badge
- Restrained entrance animations throughout (hero, cards, navbar, view transitions), fully disabled under `prefers-reduced-motion`
- Responsive layout down to small phones

---

## Data & Downloads — how a catalog entry works

The catalog is **not** part of this repo. It's published by [`nxget.packages`](https://github.com/vlT-vl/nxget.packages) (branch `api`), a separate public registry with one hand-written YAML manifest per app — this is the single source of truth shared by every consumer (this portal today, a future `nxget.cli` later):

```yaml
id: keepassxc
name: KeePassXC
publisher: KeePassXC Team
category: Security
description: A secure, offline, open source password manager.
url: https://keepassxc.org/
repo: https://github.com/keepassxreboot/keepassxc
logo: https://icons.duckduckgo.com/ip3/keepassxc.org.ico
assets:
  - platform: windows
    arch: x64
    format: MSI
    match: 'Win64\.msi$'
  - platform: macos
    arch: x64
    format: DMG
    match: 'x86_64\.dmg$'
  - platform: macos
    arch: arm64
    format: DMG
    match: '-arm64\.dmg$'
  - platform: linux
    arch: x64
    format: APPIMAGE
    match: 'x86_64\.AppImage$'
```

A monorepo publishing releases for several products under interleaved tags (e.g. `bitwarden/clients`) can also set an optional `releasePrefix` (e.g. `desktop-`), so a consumer picks the right product's release instead of just the newest one in the repo.

For apps with no GitHub repo to resolve against (a closed-source vendor with a single static download link per platform), an asset can carry a fixed `url` instead of `match`, and the manifest can omit `repo` entirely:

```yaml
id: chatgpt
name: ChatGPT
# ...no repo field...
assets:
  - platform: macos
    arch: x64
    format: DMG
    url: https://persistent.oaistatic.com/sidekick/public/ChatGPT.dmg
```

Resolving a manifest into real download links is entirely the consumer's job. All of it happens in **`src/components/DataContext.jsx`**, the app's single data-fetching component (every other component reads data through it, none fetches on its own):

1. On first mount, fetches `nxget.packages`' `v1/index.json` (discovery: id/name/publisher/category + a link to each app's manifest), then every manifest in parallel — this becomes the app catalog, refreshed automatically every hour while the portal stays open, so new or edited apps show up without a new deploy.
2. Builds a download entry directly from every asset that carries a fixed `url` — no network call involved.
3. If the manifest has a `repo`, calls `https://api.github.com/repos/<owner>/<repo>/releases?per_page=10`, honoring `releasePrefix` when present, and picks the most recent non-prerelease, non-draft release. That release gives the **current version** (its tag) and, for assets that carry `match`, the download files; the same list also feeds the "Version history" panel, so showing everything costs a single request per repo. The Apps list only needs downloads, so for an app with a `repo` but only fixed-`url` assets it does not contact GitHub at all.
4. Matches each release asset's filename against the manifest's own `match` rules (a case-insensitive regular expression) to resolve the real platform, architecture and package format for that file, and builds one download button per matched combination — never a single generic button standing in for several real options.
5. If the manifest has **no** `repo`, there is nothing to poll: the current version is the manifest's own `version` (a quoted string; an asset can carry its own `version` when it differs, and when the app-level one is omitted — Microsoft 365 — each platform's is listed). It is also the fallback if a release can't be read. There is no version history for these apps.

Apps resolved via `match` need a GitHub repository that actually publishes install binaries as release assets — not every open-source project qualifies (many develop on GitLab, Gerrit, or their own infrastructure, or don't attach binaries to GitHub Releases at all). A `url` asset has no such requirement, at the cost of a version history: with no Release to poll there is only a *current* version, which the manifest states itself.

> The unauthenticated GitHub API is rate-limited to 60 requests/hour per IP — a real constraint once the catalog can grow past a handful of apps without a portal redeploy. `DataContext.jsx` persists each repo's resolved releases (trimmed to the few fields the portal actually uses, so the cache stays small enough for the `localStorage` quota) in `localStorage` for an hour (matching the catalog's own refresh interval), revalidates with a conditional `If-None-Match` request once that expires (a `304` response doesn't count against the limit), and backs off entirely once GitHub's `X-RateLimit-Remaining` header runs low — falling back to whatever's cached, or to a "View releases on GitHub" link. This keeps a full page reload from re-triggering a fresh burst of requests, but it's still a per-IP budget shared by everyone behind the same network; a future backend/proxy remains the right place to lift the ceiling entirely for heavier traffic.

---

## Restricted apps — voucher & license

First-party apps in the `vlT Software` category are distributed **only by the owner's permission**: their download buttons are locked until a valid voucher is entered (the category, or `access: voucher` in the manifest, is what locks them). Version and version history stay visible. There is no backend, no login and no sign-up:

1. **Request** — on the app's detail page the download buttons are shown locked, next to a "Request voucher" pill (the request form itself only opens when it's clicked, and can be closed again with the × once open). The visitor enters first and last name (letters only, 24 characters in total) and the portal generates a personal *request code*: always **28 characters, the same length for everyone**, with the name written inside (one character per letter, padded to 24) followed by a 10-bit app tag and a 10-bit random nonce. The code can be decoded back into the name, so it still identifies who asked if the voucher gets passed around. The visitor sends the code to the contact address shown in the panel, by email or however they prefer — the portal sends nothing on its own.
2. **Approval** — the owner runs `node tools/voucher.mjs issue <request code>` locally, passing only that code. The script reads name, surname and app out of it (the app from the tag, looked up in the public catalog), **signs** the request with an Ed25519 private key that never leaves the owner's machine, records who it is for in a local JSON file, and prints the **complete voucher: 131 characters** (the 28 of the request + a 103-character signature). Nothing in the repository or the deployed site changes when a voucher is issued.
3. **Unlock** — the visitor always pastes the **complete** voucher (anything else is rejected). The portal checks the signature with the owner's **public key**, using the browser's built-in WebCrypto Ed25519, and that the app tag matches the page.
4. **Time-limited** — the unlock lasts **10 minutes** (`UNLOCK_MINUTES` in `src/lib/voucherStore.js`), with a countdown on the page. The voucher itself is never stored: right after verification the portal keeps only the expiry time. When it runs out — or if the page is reloaded after that — every trace is deleted (expiry, request code, name) and the downloads lock again: a **new voucher is required**. The one thing kept is a one-way hash of the spent voucher, so that the same voucher is refused if pasted again in that browser.

### The public key

The public key (`VITE_VOUCHER_PUBLIC_KEY`, 43 characters) is not a secret and lives in `.env`, which is committed with the rest of the project: the automatic deploy that runs on every push builds with it and nothing else has to be configured. The owner's script writes that line by itself. If it is missing the site still works and the unlock form says the voucher system isn't active yet; a browser without WebCrypto Ed25519 gets a specific message.

Changing the key — `node tools/voucher.mjs init --reset --yes` — is decided by the owner at any time: it generates a new key pair (backing up the old one) and rewrites the `.env` line; after the next commit and push all vouchers issued with the previous key stop working. Otherwise the key never changes, and issuing a voucher touches nothing in the repository.

**Security.** Vouchers are digital signatures, so they **can't be forged**: the public key verifies but cannot sign, and neither the public key nor any number of valid vouchers lets anyone build another one. The price is length — a secure public-key signature can't fit in a short code, hence 131 characters.

**What it still doesn't do.** It is not access control: the repositories are public, so anyone who finds a release URL can download it, and a voucher can be forwarded (the requester's name stays inside it). Using a voucher once only stops that browser from reusing it — clearing site data or using another browser gets around it, since nothing is stored server-side. Doing any of this violates the license terms, which the disclaimer states on the page.

**License button.** Every app detail page has a *License* button opening a modal with the license text. The manifest can declare `license` (a URL string or `{ url }`, GitHub `blob` links are converted to raw for CORS); without it the portal looks for `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `LICENCE` or `COPYING` in the app's `repo`. The button only appears when the license text was actually retrieved — an app with no license (or one that can't be fetched) simply has no button.

### Owner tooling (`tools/voucher.mjs`, Node 20+, no dependencies)

The `tools/` folder is git-ignored and **never part of the published repository**: it holds the private key, the issued-vouchers history (personal data) and a private write-up of the system, and lives only on the owner's machine. The script refuses to run if git tracks it or fails to ignore it.

```bash
node tools/voucher.mjs init                        # creates the key pair if missing, writes the public key into .env and prints it
node tools/voucher.mjs init --reset --yes          # changes the key: new pair (old one backed up in tools/backup/), .env rewritten
node tools/voucher.mjs issue <request code>        # prints the complete 131-character voucher and logs who it is for
```

`init` is safe to repeat: it leaves an existing key alone and rewrites only the `VITE_VOUCHER_PUBLIC_KEY` line of `.env` (recreating the file if needed). `issue` refuses a request already registered under the current key unless `--reissue` is passed (Ed25519 is deterministic, so it prints the same voucher again). The script does only these two things and shares `src/lib/voucher.js` with the portal, which contains the verification and formats but no signing code.

---

## Architecture

```
nxget-app-portal/
├── .github/workflows/deploy.yml   # build + deploy to GitHub Pages on push to main
├── index.html
├── vite.config.js
├── package.json
├── .env                           # VITE_BASE_URL, VITE_GITHUB_URL, VITE_VOUCHER_PUBLIC_KEY (public key, committed)
├── tools/                         # owner-side voucher script + data — git-ignored entirely, never published
└── src/
    ├── main.jsx                   # entry point, wraps <App/> in <DataProvider> + <LanguageProvider>
    ├── components/
    │   ├── App.jsx                 # view router (state machine) + footer
    │   ├── DataContext.jsx         # single data-fetching component: nxget.packages catalog + GitHub release resolution
    │   ├── Navbar.jsx / Theme.jsx / LanguageToggle.jsx
    │   ├── HomeView.jsx / Hero.jsx / DownloadFlow.jsx / CatalogTower.jsx / FeaturesView.jsx / CliView.jsx
    │   ├── AppsView.jsx / AppCard.jsx
    │   ├── AppDetailView.jsx / AppDownloadCard.jsx
    │   ├── VoucherPanel.jsx / LicenseModal.jsx
    │   ├── AboutView.jsx / AboutModal.jsx
    │   └── NxgetLogo.jsx / VltLogo.jsx
    ├── lib/
    │   ├── uiText.js               # IT/EN dictionary + LanguageProvider/useLang
    │   ├── access.js               # which apps are voucher-gated (`vlT Software` category or `access: voucher`)
    │   ├── appText.js              # localized card preview text from a manifest's description/about
    │   ├── tagColor.js             # shared hash-to-hue formula for category pill / logo fallback colors
    │   ├── voucher.js              # request code + Ed25519 voucher verification (WebCrypto), shared by the portal and tools/voucher.mjs
    │   ├── voucherStore.js         # useVoucher hook + localStorage persistence
    │   └── theme.js                # light/dark preference
    ├── content/about.{it,en}.txt   # About page copy, one file per language
    ├── css/                        # one stylesheet per component
    └── res/                        # nxget-logo.svg, nxget-icon.svg, nxget-download-flow.svg, catalog.svg, vltcube.svg
```

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.3.0 | UI framework |
| `react-dom` | ^19.3.0 | DOM renderer |
| `react-icons` | ^5.7.0 | Icon library |
| `js-yaml` | ^4.1.0 | Parses the YAML manifests fetched at runtime from `nxget.packages` |

| Dev | Version | Purpose |
|---|---|---|
| `vite` | ^8.3.0 | Build tool + dev server |
| `@vitejs/plugin-react` | ^6.1.1 | React Fast Refresh + JSX |

---

## Local Development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

Create a `.env` file in the root:

```env
VITE_BASE_URL=/            # set to /nxget-app-portal/ if deployed as a GitHub Pages *project* page
VITE_GITHUB_URL=           # repo URL; GitHub links only render when this is set
VITE_VOUCHER_PUBLIC_KEY=   # written by `node tools/voucher.mjs init`; without it the voucher unlock says it isn't active
```

---

## Deploy — GitHub Pages

nxget is a fully static build (`npm run build` → `dist/`), deployed automatically to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` (or manually via the workflow's "Run workflow" button).

The workflow installs dependencies, builds with `VITE_BASE_URL=/nxget-app-portal/` (this repo is a GitHub Pages *project* page — served at `https://<user>.github.io/nxget-app-portal/`, not a `<user>.github.io` root — so every asset URL must carry that sub-path), then publishes `dist/` via the official `actions/upload-pages-artifact` + `actions/deploy-pages` actions. GitHub Pages itself must be switched to **Source: GitHub Actions** once in the repo settings before the first run can publish anything.

The repo has no committed `package-lock.json` yet, so the workflow runs a plain `npm install` rather than `npm ci`; once a lockfile is committed, switch the workflow to `npm ci` (reproducible, faster) and add `cache: npm` to the `actions/setup-node` step.

---

## Version and Build

| Field | Value |
|---|---|
| Version | 0.1.0 |
| Build | R240926 |
| Updated | 24 September 2026 |

---

## License

nxget is distributed under a **Proprietary Source-Available License** — Copyright © 2025–2026 Veronesi Lorenzo (vlT). Full text in [`LICENSE`](./LICENSE).

The hosted web app is freely accessible to the public as an end user, no license or account required. The source code itself is source-available **on request**: it may be reviewed for personal study only with the copyright holder's prior authorization. Regardless of how access was obtained, modifying or creating derivative works, redistributing (copying, forking, republishing, repackaging), reverse engineering, and any commercial use all require the copyright holder's prior written permission. All intellectual property, including the name and logos, remains exclusively with Veronesi Lorenzo (vlT). The software is provided "as is", without warranty of any kind.

Governed by Italian law; exclusive jurisdiction: Milan (MI), Italy.

For licensing inquiries or to request access to the source code for study purposes: [veronesilorenzo@outlook.com](mailto:veronesilorenzo@outlook.com)

---

**Copyright © 2026 vlT di Veronesi Lorenzo. All rights reserved.**
