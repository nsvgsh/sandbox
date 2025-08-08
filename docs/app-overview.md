App Overview

Components
- Next.js frontend (Telegram WebView)
- Supabase (Postgres + Edge Functions)
- Telegram Bot / WebApp bridge
- Vercel (hosting/CDN)

Data Flow (one line per arrow)
- Telegram client → Telegram Bot → WebApp launch → Next.js UI
- Next.js (client) ↔ Supabase (Edge Functions, REST)
- Supabase DB → Next.js UI (reads)
- Vercel → Next.js build/artifacts

Notes
- No payments, error tracking, or feature flags in v1.
- Analytics via SQL over Supabase data. CDN via Vercel.


