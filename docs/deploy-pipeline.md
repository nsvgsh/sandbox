# Deploy Pipeline (Vercel)

| Item | Value |
| ---- | ----- |
| Vercel project | `tap-web-app` |
| Production branch | `main` |

## Environment Variables (Production)
| Name | Secret | Purpose |
| ---- | ------ | ------- |
| TELEGRAM_BOT_USERNAME | No | Used in deep-links |
| SUPABASE_ANON_KEY | Yes | Client-side auth |
| SERVICE_ROLE_KEY | Yes | Edge Function privileged ops |
| AD_SDK_KEY | Yes | Rewarded ads SDK |

Secrets are configured in Vercel **Project Settings → Environment Variables**.

## Build & Release Steps
1. Push to `main` triggers Vercel build.
2. Next.js is built as a static/edge hybrid; Edge Functions deployed via Vercel’s adapter.
3. Post-build, Vercel runs preview deployment; bot uses preview URL for QA.
4. Manual smoke test:
   * WebApp launches via Telegram bot.
   * Tap, level-up, rewarded ad flow.
   * RLS checks in Supabase console.
5. Promote preview to production.

