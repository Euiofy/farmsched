# Teyvat Companion

A static, browser-based Genshin Impact farming companion. Plan character and weapon upgrades, browse material rotations, track inventory, organize builds and teams, and set local farming reminders.

## Run locally

1. Extract the **entire ZIP**. Keep `index.html`, `css/`, `js/`, `data/`, and `assets/` together.
2. Open that folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server** (install the Live Server extension if necessary).

There is no npm installation, framework, backend, API key, or build step. Ordered classic scripts are used instead of native ES modules so the frontend does not depend on the module-loader restrictions of `file://` URLs. A local HTTP server is still recommended for consistent storage and notification behavior.

## Deploy on GitHub Pages

Upload the extracted contents (not just the HTML or the ZIP) into the repository root. In **Settings → Pages**, select deployment from a branch and choose the root folder. All local asset paths are relative, including the script and CSS references, so a project-site subpath is supported.

## Project map

| Location | Responsibility |
| --- | --- |
| `index.html` | Page structure, accessible navigation, forms, dialogs and SVG symbols |
| `css/` | Named stylesheets in original cascade order |
| `js/app.js` | State initialization and feature startup sequence |
| `js/core/` | Server timing, storage, navigation and common utilities |
| `js/features/` | Character and weapon plans, material schedule, inventory, planner, teams, settings, notifications and pickers |
| `js/catalog/` | Catalog image and data lookup helpers |
| `data/` | Readable bundled game catalog tables |
| `assets/` | Local fallback artwork |
| `docs/` | Architecture, maintenance and testing guidance |
| `tools/` | Optional Node.js source checker; no npm packages required |

## Important behavior

- Character and weapon plans are separate; existing browser storage keys are retained.
- Reminders are local. Keep the website open. Allow browser notifications if available; otherwise the original in-page alert fallback remains. Mobile browser support and background timing vary.
- Android push: turn on **Phone push** in Settings and subscribe to the shown topic in the free ntfy app. Reminders are handed to ntfy.sh up to 3 days ahead, so they arrive even when the site is closed; open the site at least every 3 days. Anyone who knows the topic name can read the reminders.
- Remote game artwork and extra weapon-catalog entries still require internet access. The bundled catalog remains selectable if external requests fail.
- Browser data belongs to its origin. Export a backup before moving to another address, browser profile, or device. Reminder preferences are stored separately from farming data in the original implementation.
- UID tracking and Android deployment are not included as active features. No Cloudflare or Firebase is necessary.

## Optional development check

Run `node tools/check-source.cjs` from the project folder. Node.js is only used for this development check; the website runs without it.

See [architecture](docs/ARCHITECTURE.md) and [testing](docs/TESTING.md) for more detail.

---

**License:** All rights reserved. You're welcome to read the code and learn from it, but please ask before copying or reusing it (see `LICENSE`).

**Disclaimer:** Unofficial fan project, not affiliated with or endorsed by HoYoverse. Genshin Impact and related names and artwork belong to their owners.
