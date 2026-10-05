# Tick: agent guide

Tick is a chore-planner **PWA**: the web app is a static site with no build step and no runtime dependencies (GitHub Pages serves the repo root).
It is also wrapped as a native Android app with Capacitor (`android/`); npm is used only for that wrapper (see `README.txt`).

## Layout
- `index.html`: the whole app. One inline `<style>` (CSS variables, light/dark) and one inline IIFE `<script>` (state, rendering, sound, confetti, alerts, bottom sheet). Plain ES5-style JS (`var`, function expressions); match it.
- `sw.js`: service worker. Network-first (no HTTP cache) for app files with offline fallback, stale-while-revalidate for Google Fonts.
- `manifest.webmanifest`: PWA manifest. Icons are in `icons/`.
- `scripts/check.mjs`: sanity checks. `scripts/dev.sh`: local server. `scripts/build-web.mjs`: copies the web files into `www/` for Capacitor.
- `capacitor.config.json`, `package.json`, `android/`: native Android shell (`com.cjdc007.tick`). `.github/workflows/android.yml` builds the APK/AAB in CI (the cloud env has no Android SDK, so it can't build locally).

## Commands
- `node scripts/check.mjs`: parses the inline JS, verifies precached files, manifest icons and referenced assets exist. **Run before committing.**
- `scripts/dev.sh` (or `PORT=9000 scripts/dev.sh`): serve at http://localhost:8000. Use localhost, not `file://`: the service worker doesn't register on `file://`.
- Browser testing: Chromium + Playwright are available in the cloud env (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Don't run `playwright install`.

## Rules
- **Bump the version on every change** to `index.html`, the manifest, or any icon. It is semantic (`MAJOR.MINOR.PATCH`): PATCH for fixes and polish, MINOR for new user-facing features, MAJOR for breaking changes (e.g. a saved-data format change that needs migration). Set it in two places that must match (`check.mjs` enforces it): `APP_VERSION` in `index.html` (`'1.4.1'`) and `CACHE_VERSION` in `sw.js` (`'tick-1.4.1'`). `APP_VERSION` is shown next to the Tick logo (as `v1.4.1`) so users can tell whether their phone has the latest build. Adding or renaming a file also means updating `APP_FILES`.
- Keep it dependency-free and single-file. Don't add a bundler/framework without being asked. The only external resource is Google Fonts, and it must degrade gracefully offline (system font fallbacks are already in `--display`/`--body`).
- Persistence is `localStorage` under key `tick:v1` with an in-memory fallback. State shape: `{chores, log, stats:{points,coins,streak,lastDay}, sound, pet:{species,name,full,at,owned,equipped}}`. `stats.points` is the lifetime total (drives level, never spent); `stats.coins` is the spendable balance (earned 1:1 with points). If you change the shape, stay backward compatible with existing saved data (`Object.assign` defaults at load) or migrate it.
- Dates are local-time `YYYY-MM-DD` strings (`iso`/`parse` helpers), not UTC. Avoid `toISOString()` for day keys.
- Keep it mobile-first: respect safe-area insets, `prefers-reduced-motion`, and light/dark themes (add colours as CSS variables in both palettes). Keep accessibility attributes (`aria-pressed`, `aria-selected`, focus-visible).
- Web alerts are in-page only (`checkAlerts`, while the app is open). In the native app (`window.Capacitor`), `syncNative()` also schedules real local notifications via `Capacitor.Plugins.LocalNotifications` (no bundler: use the global, don't `import`). It reschedules from `save()`, so call `save()` after any chore change.
- Native app changes: after editing web files, `npm run sync` refreshes `android/`. Keep `versionName`/`versionCode` in `android/app/build.gradle` and `package.json` in step with `APP_VERSION` (versionCode = MAJOR*10000+MINOR*100+PATCH). Never commit keystores (`.gitignore` blocks them).

## Workflow
Develop on the branch you were assigned, commit with clear messages, push. Don't open a PR unless asked.

## Companion (Pet tab)
- Fullness decays with time (`DECAY`), computed lazily from `pet.full` + `pet.at` via `fullNow()`. The pet never dies: below `HUNGRY_AT` it just looks sad. Keep it gentle; no permanent loss.
- Add creatures in the `SPECIES` registry (`draw(mood, accessories)` returns SVG, `anchors` place hats/collars/toys). Add shop items to `ITEMS` (`slot`: food | hat | collar | toy; gear has `draw(x, y)`).
- Never spend `stats.points`, only `stats.coins`. Undo and removing a Done entry take back the coins they gave (clamped at 0).
