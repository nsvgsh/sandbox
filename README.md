# Tap Mini App (working title: TapStarrr)

- Problem: Telegram users lack high‑quality hyper‑casual games with simple, transparent reward mechanics.
- Solution: A fast Telegram Mini App clicker with polished visuals and tight feedback.
- Stack: Next.js (React) on Vercel; Supabase (Postgres, Auth, Edge Functions); Telegram Web Apps bridge; Sentry (client). Animations: CSS transforms + Framer Motion; optional Rive for compact sequences. Audio via WebAudio.
- Live URL: TBA (e.g., TapStarrr or TapTapGift)

## Docs
- docs/app-overview.md
- docs/game-design.md
- docs/telegram-integration.md
- docs/db-models.md + docs/db-schema.sql
- docs/api-contracts.md
- docs/env.example
- docs/deploy-pipeline.md

Scope note: v1 avoids payments/Stars, complex ads, PvP, clans, and other heavy systems. See game design for exact inclusions and exclusions.

## Local Development (no shell exports)

1. Inside `web/`, provision local env once:
   - `npm run setup:env`
2. Start dev server:
   - `npm run dev`
3. If you use Supabase local, ensure it's running (default `DATABASE_URL` in `web/.env.local` expects Supabase defaults).

Notes:
- `DEV_TOKEN` and `NEXT_PUBLIC_DEV_TOKEN` should match; the setup script mirrors them.
- Edit `web/.env.local` to change local values; restart `next dev` after edits.

