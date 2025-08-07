# Telegram Integration

## Deep-Link Patterns
```
t.me/<bot_username>?startapp=<campaign_id>&mode=<compact|fullscreen>
```
* `campaign_id` → attribution parameter consumed by `/track/lead`.
* `mode` controls initial viewport behaviour.

## JS API Calls Used
| Category             | Methods / Objects                   |
| -------------------- | ----------------------------------- |
| Lifecycle            | `WebApp.ready()`, `WebApp.expand()`, `WebApp.close()` |
| UI Controls          | `WebApp.BackButton.show()`          |
| Viewport Handling    | `WebApp.onEvent('viewportChanged')` |
| Haptics              | `WebApp.HapticFeedback.impact()`    |

_Not used in v1_: `MainButton`, `CloudStorage`, `Payments`, `Stars`.

## `initData` Validation Flow
1. Client obtains `window.Telegram.WebApp.initDataRaw`.
2. Sends to `POST /auth/tg` (Supabase Edge Function).
3. Function verifies HMAC using `TELEGRAM_BOT_TOKEN` via `@telegram-apps/init-data-node`.
4. On success, returns Supabase JWT; client saves to `localStorage`.

`initData` TTL is enforced by the library (default 24 h).

## Monetisation
Payments / Stars are **not** implemented in v1. Revenue comes solely from rewarded ads handled client-side (e.g. Yandex Ads SDK). Server records rewards via `/ad/reward` to prevent double-claiming.

