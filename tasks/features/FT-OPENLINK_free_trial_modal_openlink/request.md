## Request: Use Telegram openLink for Free Trial modal CTA (iOS fix)

### WHAT
- Update the Free Trial level-up modal CTA to use `Telegram.WebApp.openLink(url, { try_instant_view: false })` when running inside Telegram; otherwise keep `window.open`.

### WHY
- On iOS Telegram WebView, `window.open` after async (post-fetch) is blocked, so the CTA appears to do nothing. Using Telegram's bridge reliably opens the link in the external browser and is supported on iOS.


