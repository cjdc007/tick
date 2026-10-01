# Tick: agent guide

Tick is a chore-planner **PWA**: a static site with no build step, no dependencies, no package manager.
Users install it on their phone from a static host (see `README.txt`).

## Layout
- `index.html`: the whole app. One inline `<style>` (CSS variables, light/dark) and one inline IIFE `<script>` (state, rendering, sound, confetti, alerts, bottom sheet). Plain ES5-style JS (`var`, function expressions); match it.
- `sw.js`: service worker. Network-first (no HTTP cache) for app files with offline fallback, stale-while-revalidate for Google Fonts.
- `manifest.webmanifest`: PWA manifest. Icons are in `icons/`.
- `scripts/check.mjs`: sanity checks. `scripts/dev.sh`: local server.

## Commands
- `node scripts/check.mjs`: parses the inline JS, verifies precached files, manifest icons and referenced assets exist. **Run before committing.**
- `scripts/dev.sh` (or `PORT=9000 scripts/dev.sh`): serve at http://localhost:8000. Use localhost, not `file://`: the service worker doesn't register on `file://`.
- Browser testing: Chromium + Playwright are available in the cloud env (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Don't run `playwright install`.

## Rules
- **Bump the version on every change** to `index.html`, the manifest, or any icon. It is semantic (`MAJOR.MINOR.PATCH`): PATCH for fixes and polish, MINOR for new user-facing features, MAJOR for breaking changes (e.g. a saved-data format change that needs migration). Set it in two places that must match (`check.mjs` enforces it): `APP_VERSION` in `index.html` (`'1.4.1'`) and `CACHE_VERSION` in `sw.js` (`'tick-1.4.1'`). `APP_VERSION` is shown next to the Tick logo (as `v1.4.1`) so users can tell whether their phone has the latest build. Adding or renaming a file also means updating `APP_FILES`.
- Keep it dependency-free and single-file. Don't add a bundler/framework without being asked. The only external resource is Google Fonts, and it must degrade gracefully offline (system font fallbacks are already in `--display`/`--body`).
- Persistence is `localStorage` under key `tick:v1` with an in-memory fallback. State shape: `{chores, log, stats:{points,streak,lastDay}, sound}`. If you change the shape, stay backward compatible with existing saved data (`Object.assign` defaults at load) or migrate it.
- Dates are local-time `YYYY-MM-DD` strings (`iso`/`parse` helpers), not UTC. Avoid `toISOString()` for day keys.
- Keep it mobile-first: respect safe-area insets, `prefers-reduced-motion`, and light/dark themes (add colours as CSS variables in both palettes). Keep accessibility attributes (`aria-pressed`, `aria-selected`, focus-visible).
- Alerts are in-page only (`checkAlerts`, while the app is open), not push notifications.

## Workflow
Develop on the branch you were assigned, commit with clear messages, push. Don't open a PR unless asked.
