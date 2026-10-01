// Copies the web app into www/ for Capacitor (native shells bundle these files). Run: npm run build:web
import { rmSync, mkdirSync, cpSync } from 'node:fs';
rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'sw.js', 'icons']) cpSync(f, `www/${f}`, { recursive: true });
console.log('www/ ready');
