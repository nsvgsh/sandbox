Deploy Pipeline (Vercel)

Project
- Name: `tap-web-app`
- Production branch: `main`

Environment Variables (Vercel)
| Key                     | Secret? | Why |
|-------------------------|---------|-----|
| TELEGRAM_BOT_USERNAME   | no      | Build-time deep-links in meta tags |
| TELEGRAM_APP_SHORT_NAME | no      | Build-time deep-links in meta tags |
| TELEGRAM_BOT_ID         | no      | Fallback for `validate3rd()` in browser |
| SUPABASE_URL            | no      | Runtime API base URL for client SDK |
| SUPABASE_ANON_KEY       | yes     | Client-side Auth (public but treat as credential) |

Notes
- Secrets are set only via Vercel Environment Variables UI or `vercel env add`.
- Service-role keys and bot tokens live only in Supabase Edge Functions.

Post-deploy Checks (manual for v1)
- Launch mini-app via deep-link; verify initData auth, tap loop, and task bundle unlock at L5.
- Verify leaderboard endpoints and caching.


