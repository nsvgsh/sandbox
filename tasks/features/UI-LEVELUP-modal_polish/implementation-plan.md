# UI-LEVELUP-modal_polish — Implementation Plan

## Architectural analysis
- Container standard: `inline-size: clamp(0px, 100%, 420px)` across `ScreenContainer`, `Wallet`, `Earn`, `Header`.
- Tokens: `--theme-foreground/background` in `globals.css`. CTA/Tile use border-image patterns; typography uses Lilita One with `-webkit-text-stroke` (≈ 0.018–0.03em) and drop-shadow (≈ 0.07–0.08em).
- Current modal issues:
  - Fixed min/max heights; bespoke gradient; global white text in `.card`.
  - Inline styles for button labels; duplicate `@font-face` in modal CSS.
  - Reward visuals built with stretched `<img>` backgrounds rather than border-image pattern; case-mixed asset paths.

## Tasks
1. Layout grid and container alignment
   - Apply 420px cap to modal card or wrapper: `inline-size: clamp(0px, 100%, 420px)`; center horizontally.
   - Convert `.card` to grid with three rows: `grid-template-rows: minmax(0, 5fr) minmax(0, 3fr) minmax(64px, 2fr)`.
   - Remove `min-height: 550px`/fixed `max-height`; keep `max-height: calc(90dvh - safe-area)`; ensure child sections use `min-height: 0`.
   - Only middle (rewards) section scrolls; prevent nested scroll traps.

2. Tokens, gradient, and typography
   - Replace `.card { color: #ffffff }` with tokenized colors; validate contrast on background.
   - Optionally align background with app gradient or define `--modal-background-gradient`.
   - Dedupe `@font-face` for Lilita One; keep single definition (e.g., in `Button` or global).
   - Move inline label styles to CSS classes matching CTA/Tile conventions (`-webkit-text-stroke` 0.018–0.03em; drop-shadow 0.07–0.08em; clamp/cq sizing).

3. Reusable RewardPill extraction
   - Create `web/src/ui/shared/RewardPill/` with `RewardPill.tsx` and `RewardPill.module.css`.
   - Props: `{ iconSrc: string; label: string | number; variant?: 'blue' | 'green' | 'yellow' }`.
   - Implement border-image background (CTA/Tile pattern), overlay grid, container queries (`container-type: size`) for label sizing; icon scales via cqw/cqh; no distortion.
   - Replace modal reward tiles with `RewardPill` instances (coins/tickets).

4. Accessibility & interactions
   - Add focus trap within modal; initial focus to primary CTA.
   - Esc/overlay click to close (overlay close configurable); prevent background scroll while open.
   - Ensure tab order follows grid: header → rewards → CTAs; visible focus in dark theme.

5. Assets hygiene
   - Normalize asset file casing (`.png`), update references; remove duplicates; verify paths.

6. QA pass
   - Viewports 320–420px; short/tall dvh; iOS/Android safe areas; large text scaling.
   - Verify z-index over HUD/BottomNav; single scroll region (rewards) without jank; no background scroll.

## Documentation impact
- This plan is self-contained; no API changes. Document `RewardPill` usage for future modals.

## Acceptance criteria
- Grid 50/30/20 implemented with minmax; CTAs visible; rewards scroll only.
- 420px cap applied; tokenized colors/gradient; typography consistent with CTA/Tile; no inline styles.
- Reward visuals via `RewardPill` (border-image pattern); icons scale via cqw/cqh; no distortion.
- A11y complete: focus trap, initial focus, Esc/overlay close, background scroll prevented.


