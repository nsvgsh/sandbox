| DOCS-BASELINE | Created README, app-overview, game-design, telegram-integration, db-models, db-schema.sql, api-contracts, env.example, deploy-pipeline |
| LOCAL-BOOTSTRAP | Local dev stack scaffolded (Next.js app, Supabase CLI Postgres, API routes, dev login) |
| GD-ALIGN-HIPRI-1 | Server-side coin earning (taps × coin_multiplier), removed client coinsDelta, thresholds base from config (default 10) |
| REWARD-POLICY | Implemented server-side reward policy; claim idempotency; banked coins; multiplied tickets; updated docs |
| ADMIN-TOOLS | Added local admin endpoints for thresholds and debug state |
| HOTPATH-TICKETS | Apply base tickets on level-up during ingest |
| GD-ALIGN-HIPRI | Aligned core loop: server-side tap earnings, thresholds base=10, unified next-threshold |
| LVL-TEMPLATES | Per-level reward templates; base grant on level-up; snapshot in level_events |
| AD-STUB | Auto-apply incremental level bonus on ad_completed (local) |
| TASKS-AD-VIEW | Enforced ad requirement on task claim; updated counters on claim |
| INGEST-SOFT | Soft clamp taps and checksum awareness via game_config.ingest |
| LEADERBOARD-META | Returned me rank and activePlayers in leaderboard |
| ADMIN-TOOLS | Debug state includes nextTemplates and config subset |
| DOCS-TRACE-FOUNDATION | Added Feature Catalog under docs/feature-catalog.md |
| SESSION-CLAIM | Added POST /v1/session/claim endpoint to safely resume sessions and return authoritative ids |
| TASKS-VERIFY | Documented task verification policy (grant-now, record-only partner status; no reconciliation) |
| AD-SIM-INTENT | Intent‑coupled ad simulation: ad/log accepts intent; task claim requires matching intent within TTL |
| LOCAL-ENV-BOOTSTRAP-001 | Local dev via web/.env.local; setup & validation scripts |
| API-AD-LOG-REFACTOR | /v1/ad/log records ads and returns impressionId+expiresInSec; no bonus apply on this route |
| UI-LEVEL-BONUS-FLOW | Level-up UX: Claim | X2 bonus; Claim x2 within ad_ttl_seconds; auto-revert on expiry |
| ADMIN-DEBUG-ADTTL | Admin debug state exposes ad_ttl_seconds |
| CONFIG-TTL-DEFAULTS | Set local ad_ttl_seconds default to 10s; deprecated claim_ttl_seconds for bonus flow |
| X2-POLICY-A-ONLY-001 | Added claim_level_bonus_v3 (A-only); idempotent by impressionId; mark ad_events as used; wired claim route to v3 |
| UI-HOME-MAIN | Main screen scaffold in-place: counters header, avatar row, Tap Area, fixed bottom navigation |
| UI-LEVELUP-MODAL | Level-up modal with base reward reveal; x2 flow with advisory countdown and idempotent claim; shows total x2 rewards after ad-view |
| AD-PARTNER-FREE-TRIAL-DB | Added level_offer_schedule, config keys for partner redirect, and ad intent index |
| AD-PARTNER-FREE-TRIAL-APPLY | Updated apply_tap_batch to honor Free Trial schedule and skip base rewards |
| AD-PARTNER-FREE-TRIAL-REDIRECT | Added /api/v1/offer/free-trial/{taskId}/redirect endpoint with secure host check and ad-like logging |
| AD-PARTNER-FREE-TRIAL-CLAIM | Branched tasks claim: Free Trial has no TTL; consumes latest eligible click |
| AD-PARTNER-FREE-TRIAL-TASKS | Extended GET /api/v1/tasks to include partner metadata via schedule join |
| UI-OFFERS-SCREEN | Offers screen (in-place): AVAILABLE/COMPLETED tabs, intent-coupled ad unlocks with TTL, sessionStorage persistence, per-task claim countdown |
| UI-OFFERS-CLAIM-MODAL | Task claim success popup: "congratulations!" with reward: task_reward list |
| UI-WALLET-SCREEN | Wallet shell (in-place): connect wallet (local address only), assets (TON/USDT placeholders), Coins/Tickets, Withdrawals/Activity/Airdrop tabs |
| UI-NAV-CLICKABLE | Bottom bar navigation made clickable; removed duplicate top navigation |
| TASKS-IDEMPOTENCY-004 | Added claim_task_v2 with idempotency key; task claim marks matched ad as used (spend-once) |
| LEVEL-REVEAL-ENDPOINT | Added GET /v1/level/last for public reward reveal |
| CONFIG-SOURCE-PUBLIC | UI reads ad_ttl_seconds and batch_min_interval_ms only from GET /v1/config |
| CLIENT-HELPER | Unified counters shape and calm retry helper (one retry for 429/409/network) adopted across taps/bonus/tasks |
| UI-OFFERS-BEHAVIOR-UPDATE | Removed EXPIRED tab; on TTL expiry tasks stay in AVAILABLE and show Watch ad again |
| OBS-CLIENT-TELEMETRY | Added minimal client logs: TooFastRetry, OutOfDateRefresh, NetRetry, TTLExpired, AlreadyClaimed, TaskClaimIdemKeyUsed, AdRequired |
| X2-FLOW-AD_TTL_FROM_T1 | X2 claim gated by ad_ttl_seconds from ad success (t1); base claim ungated; added claim_level_bonus_v4; simplified /v1/ad/log; updated docs |
| AD-MONETAG-INT-SDK | Integrated Monetag Rewarded Interstitial via script-tag SDK; runtime config (monetag_enabled, monetag_zone_id, monetag_sdk_url); server logs closed/failed with provider payload; client countdown from t1; failure path does not unlock |
| UI-GRADIENT-0001 | Applied bottom-to-top page background gradient (#275c99 → #162e54); preserved solid background token for components |
| UI-BOTTOMNAV-0001 | Introduced bottom nav color tokens and applied in page |
| UI-BOTTOMNAV-0002 | Added --bottomnav-height token; nav uses fixed height; main layout references token |
| UI-BOTTOMNAV-0003 | Replaced inline shadow with .bottomNav::before gradient overlay |
| UI-MONETAG-0001 | Hardened loader (explicit fn, cache-bust, readiness) and error categories |
| UI-BOTTOMNAV-SANDBOX | Added single-file bottomnav sandbox (template + inline script) |
| OFFERS-REFRESH-0001 | EARN: refresh tasks on entry and on level change |
| OFFERS-REFRESH-0002 | EARN: fixed flicker by pruning ad unlocks without unnecessary state updates |
| UI-EARN-TILES | Refactored Earn sandbox to 2-column tiles, removed tabs/cards; badge and content rendered over Button03_Blue.png; no visual underlay |
| UI_EARN_PHASE2-001 | Ported Earn sandbox to React components and integrated under BottomNav EARN |
| UI-EARN-0001 | Adjusted Earn tabs to Lilita One with stroke/shadow; empty state typography updated |
| UI-BOTTOMNAV-active_tap_states | Added active indicator and tap feedback to bottom nav |
| UI-LEVELUP-MODAL-POLISH-001 | Constrained modal to 420px, added 3-row grid (50/30/20), tokenized colors/typography, extracted RewardPill, removed inline styles |
| ENV-0001 | Added DATABASE_URL to docs/env.example; setup script now includes it for web/.env.local |
| TAP-BATCHING-001 | Added DB-backed tap aggregation config (006_tap_agg_config.sql) |
| TAP-BATCHING-002 | Implemented client tap aggregator and flusher with monotonic UI |
| TAP-BATCHING-003 | Parsed tap_agg config on client and wired UI tuning |
| TAP-BATCHING-004 | Updated docs: overview, API contracts, deploy pipeline, env, db models |
| ADS-STATUS-0001 | Normalize ad success: server writes status='completed'; strict claim check |
| WEB-COOKIES-0001 | Set dev cookie SameSite=None; Secure; added header fallback for Telegram Web |
| UI-HOME-CTA | Rotating circular CTA text around tap button; idle fade-in/out; reduced-motion respected |
| WEB-BUILD-0001 | Fix Vercel build blocker by removing `any` from RotatingTextRing CSS variables |
| AD-PARTNER-FREE-TRIAL-READY-API | Added GET /api/v1/tasks/{taskId}/ready endpoint |
| AD-PARTNER-FREE-TRIAL-READY-UI | Earn grid flips CTA to Claim after readiness; partner opens in new tab |
| UI-LEVELUP-FREE-TRIAL | Free Trial level-up modal (non-claimable CTA, asset, close control) |
| UI-LEVELUP-DECISION-GATE | One-shot decision per level; removed flicker between regular and FT modals |
| CLAIM-PARTNER-IDEM-HARDEN | Free Trial claim uses server ad_event.id as idempotency key |
| UI-EARN-FREE-TRIAL-CTA | Partner tile variant: open in new tab; readiness-based Claim |
| PROGRESSION-NO-SPEND-012 | Removed coin deduction on level-up; coins never decrease |
| PROGRESSION-POLY-013 | Polynomial thresholds via _threshold_for_level; no-spend preserved |
| THRESHOLDS-POLY-CONFIG-014 | thresholds_poly coefficients in game_config (runtime-configurable) |
| UI-HUD-TWEEN | Animated HUD numbers via hud_tween_ms (config) |
| UI-TAP-BUBBLE | Tap particle shows +coins_per_tap×mult (optimistic) |
| OPS-GAME-ADMIN | Added ops/game-admin flow (input.json → output.sql) and generator script |
| OPS-INTEGRATIONS-ADMIN | Added ops/integrations-admin (Monetag & Free Trial) and generator script |
| MULT-ABS-SET-015 | coin_multiplier treated as ABSOLUTE set; x2 ignores multiplier; intents separated |
| FT-FTMODAL-001 | Decoupled Free Trial level-up modal from taskId; added level-based redirect |
| FT-FTMODAL-002 | Updated frontend to call level-based modal redirect |
| FT-FTMODAL-003 | Standardized Free Trial Earn placement to 'earn_tile' |
| FT-FTMODAL-004 | Updated docs to reflect decoupled modal and placements |
| OPS-LOCALDB-001 | Local DB orchestrator: drop/recreate, schema+migrations, admin SQL |
| OPS-ADMIN-REPLACE-001 | Admin generators now replace data (delete stale, reinsert new) |
| OPS-ADMIN-FT-NOSYNC-001 | Disabled free_trial→tasks sync; Earn formed strictly from tasks |
| OPS-NORM-EARN-001 | Earn uses kind only (free-trial/in_app); removed partnerKey and joins |
| OPS-FLUSH-IMMEDIATE-001 | Immediate flush on threshold; effectiveFlush = min(flush_threshold, max_taps_per_batch) |
| OPS-REMOTE-0001 | Fixed Supabase run error: replaced invalid TRUNCATE IF EXISTS with safe DO block |
| ADS-PROPELLER-0001 | PropellerAds S2S: start-param attribution via `attribution_leads`; DB-backed config; synchronous postback on first user creation; audit in `partner_postbacks` |
| ADS-PROPELLER-0001-CLAIM | Forwarded `x-startapp` on session claim; server persists attribution and triggers postback on claim path |
| ADS-PROPELLER-0001-MONETAG | Monetag milestones → PropellerAds postbacks: 1st → goal=2, 3rd → goal=3; optional payout via config |
| TG-AUTH-DB | Added migrations: telegram_identities (tg_user_id→user_id) and dev_whitelist |
| TG-AUTH | Implemented POST /api/v1/auth/tg (validate initData, upsert mapping, set cookie) |
| TG-AUTH | Added POST /api/v1/auth/dev/allowlist (probe-only; whitelist check; no side effects) |
| TG-AUTH | Hardened POST /api/v1/auth/dev: supports x-telegram-user-id + whitelist; random dev gated by ENABLE_RANDOM_DEV_USER |
| UI-AUTH-GATE | Client AuthGate: inside Telegram probe→choice or auto auth; outside Telegram dev affordance gated by NEXT_PUBLIC_ENABLE_OUTSIDE_TG_DEV & ?dev=1 |
| DOCS-TG-AUTH | Updated api-contracts, app-overview, telegram-integration (Mermaid flow + tutorials), env.example |