# Architecture and maintenance

## Design goal

This is a source-only refactor of the verified standalone notification version. It keeps the interface, data model, local storage keys, render logic and feature behavior. It does not introduce a framework or a backend.

## Startup contract

`index.html` loads the classic scripts at the end of the document. They share a single page-level lexical environment (`const` / `let`), not a collection of exported browser-global properties. Pure catalog tables and feature function definitions load first. `js/app.js` then initializes state and binds controls in the source application's original order. `js/select-menu.js` runs after the app has rendered. Initialization functions are split at dependency boundaries; their numbered suffixes refer to that startup sequence.

Do not add `async` or change script ordering. Do not load `app.js` in isolation. If introducing an additional file, update both the HTML and `tools/source-manifest.json`. The original application has cross-feature dependencies; classic scripts deliberately preserve them to reduce migration risk. A future isolation into explicitly imported ES modules would be a separate change requiring deployment and integration tests.

## Where to make changes

- Character selection: `js/features/character-picker.js`; character domain logic: `js/features/journey.js`.
- Weapon selection and its separate calendar: `js/features/weapon-journey.js`; weapon names and starter rows: `data/weapons.js`.
- Material availability: `js/features/materials.js`; materials and icon metadata: `data/materials.js` and `js/catalog/materials.js`.
- Inventory: `js/features/inventory.js` and `js/features/material-picker.js`.
- Character builds: `js/features/planner.js`; team editor: `js/features/teams.js`.
- User preferences and backups: `js/features/settings.js`; reminder scheduler: `js/features/notifications.js`.
- State normalization and persistence: `js/core/storage.js`; time and reset calculations: `js/core/server.js`.

## CSS

Named stylesheets preserve the original selector/declaration sequence (including older responsive overrides). They are not interchangeable in load order. Start with the relevant named file and inspect later stylesheets if an existing rule is overridden. The refactor intentionally does not remove legacy CSS or rewrite generated HTML templates: these changes would create unnecessary layout and behavior risk. A few inline presentation styles are preserved for parity.

## Data and assets

The `data/` files are readable static JavaScript dictionaries and arrays. Keep game names, IDs, rarity values and domain relationships exact. Using classic-script data avoids an extra JSON network fetch at startup. `js/catalog/` holds artwork and catalog helpers. The formerly embedded Freedom book PNG is a local file under `assets/`. Other game artwork is served by the original external providers.

## Persistence

The existing main key `teyvat_companion_v2` is unchanged. Reminder preferences use `teyvat-farming-reminders-v1`, and reminder history uses `teyvat-farming-reminders-sent-v1`, and the ntfy phone-push topic plus scheduled-message record use `teyvat-farming-ntfy-v1`. Existing roster view keys remain unchanged. Do not rename keys without an explicit migration. The browser's local storage is independent for each website origin.
