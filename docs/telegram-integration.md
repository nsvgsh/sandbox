# Telegram integration

## Deep-link patterns (v1)
- Direct Mini App (main only, single app under bot):
  `t.me/<bot_username>?startapp[=<campaign_id>]&mode=<compact|fullscreen>`
- Attachment menu variants: `t.me/<bot_username>?startattach[=<start_parameter>]` and chat-scoped variants.
- Param exposure: read `tgWebAppStartParam` for routing/attribution; `initDataUnsafe.start_param` only for attachment-menu links.

## JS API usage (subset)
- Telegram.WebApp.ready(), expand(), close()
- Telegram.WebApp.BackButton
- Telegram.WebApp.onEvent('viewportChanged')
- HapticFeedback deferred in v1

## initData validation
- Client sends initDataRaw on first launch
- Edge Function validates HMAC-SHA-256 and TTL, issues JWT, upserts user
- Never trust `start_param` prior to validation

## Payments & Stars
- Out of scope in v1 (pure ad-monetised loop)
