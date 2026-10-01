TICK - install on your phone
1. Upload this whole folder to a static host (Netlify Drop, GitHub Pages, Cloudflare Pages).
2. Open the https:// link on your phone.
3. iPhone: Safari > Share > Add to Home Screen.  Android: Chrome > menu > Install app.
Open it once while online so it can save itself for offline use.
If you edit any file, change CACHE_VERSION in sw.js so phones pick up the update.

ANDROID APP (Capacitor)
The web app is wrapped in a native Android shell in android/. Native notifications fire even when the app is closed.
- Build: GitHub > Actions > "Android build" > Run workflow. Download "tick-debug-apk" from the run and install it on a phone to test.
- Google Play: add these repository secrets (Settings > Secrets and variables > Actions), then re-run the workflow to get "tick-release-aab" to upload in Play Console:
  ANDROID_KEYSTORE_BASE64 (base64 of your upload keystore), ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
  Create a keystore once with: keytool -genkey -v -keystore tick.keystore -alias tick -keyalg RSA -keysize 2048 -validity 10000   (keep it safe: you need the same one for every update)
- Locally (needs Android Studio): npm install && npm run android:open
