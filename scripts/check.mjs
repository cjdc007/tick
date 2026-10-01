// Dependency-free sanity checks for Tick. Run: node scripts/check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let failed = 0;
const fail = (m) => { console.error('FAIL: ' + m); failed++; };
const ok = (m) => console.log('ok: ' + m);

// 1. Inline <script> in index.html parses.
const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) fail('no inline <script> found in index.html');
scripts.forEach((code, i) => {
  const f = join(mkdtempSync(join(tmpdir(), 'tick-')), `s${i}.js`);
  writeFileSync(f, code);
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); ok(`inline script #${i + 1} parses`); }
  catch (e) { fail(`inline script #${i + 1} syntax error:\n${e.stderr}`); }
});

// 2. Every file the service worker precaches exists.
const sw = readFileSync('sw.js', 'utf8');
const list = sw.match(/APP_FILES\s*=\s*\[([\s\S]*?)\]/);
if (!list) fail('APP_FILES not found in sw.js');
else for (const [, p] of list[1].matchAll(/'([^']+)'/g)) {
  const path = p === './' ? 'index.html' : p.replace(/^\.\//, '');
  existsSync(path) ? ok(`precached ${p}`) : fail(`sw.js precaches missing file ${p}`);
}

// 2b. Visible app version matches the service worker cache version.
{
  const av = html.match(/APP_VERSION='([^']+)'/), cv = sw.match(/CACHE_VERSION = 'tick-([^']+)'/);
  const semver = /^\d+\.\d+\.\d+$/;
  if (!av || !cv) fail('APP_VERSION (index.html) or CACHE_VERSION (sw.js) not found');
  else if (!semver.test(av[1])) fail(`APP_VERSION ${av[1]} is not MAJOR.MINOR.PATCH`);
  else av[1] === cv[1] ? ok(`version ${av[1]}`) : fail(`APP_VERSION ${av[1]} != CACHE_VERSION tick-${cv[1]}`);
}

// 3. Manifest is valid JSON and its icons exist.
try {
  const m = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  for (const i of m.icons || []) existsSync(i.src) ? ok(`manifest icon ${i.src}`) : fail(`manifest icon missing: ${i.src}`);
} catch (e) { fail('manifest.webmanifest: ' + e.message); }

// 4. Files referenced from index.html exist.
for (const [, p] of html.matchAll(/(?:href|src)="((?!https?:|#|data:)[^"]+)"/g)) {
  existsSync(p) ? ok(`referenced ${p}`) : fail(`index.html references missing file ${p}`);
}

// 5. Reminder: app files changed without a cache bump (only when in a git repo with a base).
try {
  const changed = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { stdio: 'pipe' }).toString().split('\n');
  const appChanged = changed.some((f) => /^(index\.html|manifest\.webmanifest|icons\/)/.test(f));
  if (appChanged && !changed.includes('sw.js')) console.warn('WARN: app files changed vs origin/main but sw.js (CACHE_VERSION) was not touched');
} catch {}

process.exit(failed ? 1 : 0);
