# UI-CLICKER — Emoji Clicker Component (Implementation Plan)

### Current situation
- Clicker game core loop per `docs/game-design.md`: taps earn Coins; level-up offers ad‑gated bonus; Tap Area is the primary surface on Home/Game (`docs/app-overview.md`).
- This task is UI‑only; it must remain compatible with future `/v1/ingest/taps` integration (`docs/api-contracts.md`).
- Stack: Next.js app under `web/`, CSS Modules, mobile‑first UI inside Telegram WebView (`docs/telegram-integration.md`).

### Approaches
🟢 Approach A — React + CSS Modules (3D illusion) + optional SVG mask
- Pros:
  - Minimal deps, fits repo patterns, GPU‑friendly transform/opacity animations, fast delivery, easy theming/iteration.
  - Dynamic emoji text trivial; DOM particle layer is sufficient for target counts.
- Cons:
  - 3D realism is an illusion; “shape follows emoji” is approximated by radius/padding/mask heuristics.

🟢 Approach B — Canvas/WebGL renderer
- Pros: Highest performance for many particles, precise control over shading/shape.
- Cons: Overkill for scope; complex in Telegram WebView; text/emoji rendering and hit‑testing add friction.

🟢 Approach C — Lottie/sprite particles for "+1"
- Pros: High visual polish with minimal runtime logic.
- Cons: Adds asset pipeline/dependency; dynamic emoji text in particles is harder.

Recommendation: 🟢 Approach A — best balance of delivery speed, UX quality, and maintainability.

### Detailed plan (Recommended)
1) Component scaffold
- Files: `web/src/ui/Clicker/EmojiClicker.tsx`, `web/src/ui/Clicker/EmojiClicker.module.css`.
- Props: `emojis?: string[]`, `onTap?: (emoji: string) => void`, `size?: number`, `className?: string`, `haptics?: boolean`.
- State: `currentEmoji`, `tapCount`, `isPressing`, `particles` (circular buffer: `{ id, x, y, emoji }`).
- Defaults: emoji set like ["🍪","🍋","🍎","🪙","🎟","⭐️","💎"].

2) Emoji rotation (every 3 taps)
- On tap increment counter; if `tapCount % 3 === 0` choose a different random emoji from `emojis` (retry until differs, guard for length < 2).

3) Interaction & haptics
- Pointer down: scale to 0.94, strengthen inset shadow; pointer up: bounce to 1.0 via keyframe.
- If `haptics` and `Telegram.WebApp?.HapticFeedback` exist, call `impactOccurred('soft')` on each tap (best‑effort, no throw).

4) 3D button visual + “shape corresponds to symbol”
- Use gradients, highlights, inset/outset shadows to simulate 3D.
- Heuristic fit: adjust border‑radius and padding via CSS custom props based on measured content width class (narrow/wide). Optional SVG mask to clip highlight area to emoji bounds for better shape illusion.

5) RPG‑like floating feedback
- Capture tap coordinates within component; push particle `"+1 <emoji>"` at that point.
- CSS keyframes: translateY(−24..32px) and fade to 0 over 600–800ms; remove on `animationend` or timeout; pool size ~12 (recycle oldest).

6) Performance & mobile safety
- Use only transform/opacity; set `will-change` on animated layers; avoid layout thrash.
- Disable text selection and touch callouts; min hit area ≥96px.

7) Accessibility & API surface
- role="button", `aria-label` uses current emoji; keyboard focus is non‑primary in WebView, but do not regress.
- Fire `onTap(currentEmoji)` synchronously; no network logic here; later wiring will batch taps to `/v1/ingest/taps`.

8) Showcase and verification
- Add a small, clearly delimited showcase block in `web/src/app/page.tsx` (guard by a local boolean) for manual testing without impacting existing flows.
- Verify on iOS/Android Telegram; ensure particles GC and no memory bloat.

### Edge cases / risks
- Emoji rendering differences across platforms; choose a safe default set and allow override via props.
- `emojis` length < 2: skip rotation; still show particles.
- Telegram Haptics unavailable: silently skip.
- Very fast tapping: throttle particle creation to pool size; avoid event backlog.
- SSR: guard `window`/`Telegram` access in effects only.

### Tasks
- [ ] Add component and styles implementing behavior and effects
- [ ] Showcase in `web/src/app/page.tsx` for manual testing (feature‑guarded)
- [ ] Lint/type check and mobile verification
- [ ] Update docs per Documentation impact

### Documentation impact
- `docs/app-overview.md`: reference the Emoji Clicker as Tap Area implementation detail.
- `docs/UI-mocks-wireframes/wireframes/home-game.md`: annotate Tap Area as emoji‑based 3D button with "+1 <emoji>" particles.
