1. Baseline document set (The minimum you need so that any future coding-agent instantly sees the full picture)

• /README.md – one-screen executive summary (problem, solution in one line, tech stack, live URL).  
• /docs/app-overview.md – diagram of the whole system (Next.js front, Supabase, Telegram WebApp bridge, Vercel).  
• /docs/game-design.md – core loop, progression rules, currency formulas, UI mock links. No “nice-to-have” ideas, only v1 scope.  
• /docs/telegram-integration.md –  
 – initData validation flow, signature check example.  
 – deep-link patterns you intend to support (`t.me/bot?startapp=…`).  
 – list of Telegram JS API calls actually used (buttons, viewport, payments).  
• /docs/db-schema.sql + /docs/db-models.md – declarative SQL (or Supabase migration) plus a sentence per table/column.  
• /docs/api-contracts.md – if you expose any edge functions: route, method, request/response JSON, auth requirement.  
• /docs/env.example – all runtime variables with one-line description.  
• /docs/deploy-pipeline.md – Vercel project name, production branch, required secrets, post-deploy checks.  
• /tasks/** – follow the workspace “Development & Documentation Protocol”; every feature/fix gets a ticket and an implementation-plan file.  
• /CHANGELOG.md – 1-line per finished sub-task (already mandated by protocol).  

2. Known unknown → resolved  
“What documents are needed?” → the list above. Keep each file ≤1 page; agents read quicker than they reason.

3. Unknown unknowns (items that commonly bite Telegram mini-app projects)

• Telegram WebApp API limits: user-agent quirks inside iOS vs Android vs desktop-web.  
• `initData` expires in 24 hours – decide how you refresh auth silently.  
• Payments / Telegram Stars – fee structure, required server-side receipt validation.  
• Rate-limits for `answerWebAppQuery` and other write methods.  
• Content Security Policy: in-app browser blocks `unsafe-eval`; pick libraries accordingly.  
• Viewport resizing when the in-chat webview is pulled down (keyboard, caption bar).  
• Offline / flaky connectivity inside Telegram: how will the clicker queue unsent events?  
• Cheat prevention (client-side click inflation).  
• Supabase row-level-security rules – forgotten RLS equals public data leak.  
• Data privacy / GDPR export request path.  
• Analytics: Telegram closes `window.Telegram` on external links – plan event batching.  
• Multi-device sync delays (webview ↔ bot ↔ DB) and eventual conflicts.  
• App size budget: first paint must feel instant inside chat; heavy assets kill conversion.  
• Browser-specific audio autoplay restrictions (reward sounds).  
• Vercel edge limits: 5 s cold-start for functions on free tier could break webhook latency.  
• Future growth: attachment-menu vs direct-link mini-app – different review processes at Telegram.

Start by writing the README and the three core docs (app-overview, telegram-integration, db-schema). Everything else can iterate concurrently with code.