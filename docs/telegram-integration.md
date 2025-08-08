Telegram Integration

Deep-link Patterns
- `t.me/<bot>/<short_name>?startapp=<campaign_id>&mode=<compact|fullscreen>`
- On first load, client posts `{ campaign_id, tg_user_id }` to `/track/lead` (Supabase Edge) for attribution.

Web Apps JS API Usage (v1)
- `Telegram.WebApp.ready()` — handshake / disable loading bar
- `Telegram.WebApp.expand()`, `close()` — viewport control
- `Telegram.WebApp.BackButton` — navigation
- `Telegram.WebApp.onEvent('viewportChanged')` — safe-area paddings
- `Telegram.WebApp.HapticFeedback.*` — tactile feedback
- Not in v1: `MainButton`, `CloudStorage`, payments/Stars

Auth: initData Validation
- Endpoint: `POST /auth/tg` (Supabase Edge Function, TypeScript)
- Library: `@telegram-apps/init-data-node`
- Client sends `Authorization: tma <initDataRaw>`
- Server validates HMAC-SHA-256 with bot token, `expiresIn: 3600`; on success parse user, upsert DB, issue Supabase JWT
- Security: pass SHA-256 hashed bot token with `{ tokenHashed: true }`

Payments / Stars
- Not included in v1 (deferred).


