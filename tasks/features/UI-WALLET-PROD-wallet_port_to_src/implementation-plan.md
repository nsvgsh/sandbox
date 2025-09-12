# Implementation Plan — UI‑WALLET‑PROD (React port with parity harness)

## Architectural analysis
- Sandbox source of truth: `web/public/dev/ui/wallet/` (`index.html`, `styles.css`, assets/). It defines container clamps, safe-area padding, panels, CTA nine-slice, tabs, and number formatting via DOM script.
- Production runtime: `web/src/app/page.tsx` manages sections via `activeSection: 'home' | 'offers' | 'wallet'`. Earn has been ported as React components under `web/src/ui/earn/` with public assets under `web/public/ui/earn/` — this is the precedent we will mirror.
- Current wallet in prod is a minimal inline scaffold inside `page.tsx`; we will replace it with a React Wallet component that matches sandbox visuals exactly.
- Drift risks moving to React/CSS Modules: CSS scoping, container/size constraints, `border-image` nine-slice, font loading, asset paths/casing, tabs a11y/active state, number formatting widths, adjacency-based spacing, glow stacking, focus-visible states.

## Task list
1) Project scaffolding & assets
   - Create `web/src/ui/wallet/` directory for components.
   - Create `web/public/ui/wallet/` and copy assets preserving casing: `Button01_Yellow.Png`, `Icon_Golds.Png`, `Ton Icon.png`, `USDT Icons.png`. If tickets icon path is needed, mirror to `/ui/header/Whisk_Purple_Ticket.png` and update references.
   - Ensure `Lilita One` font is available once (reuse the existing font-face; avoid duplication).

2) Components (CSS Modules) — mirror sandbox structure
   - `Wallet/Wallet.tsx` + `Wallet.module.css`: container clamps [320..420], safe-area padding, panels, header (title + note), connect section, divider, assets list, tabs.
   - `components/CTA/CTA.tsx` + `CTA.module.css`: nine-slice button using `border-image` from `/ui/wallet/Button01_Yellow.Png`; compute `--cta-height` from container width; apply label nudge transform.
   - `components/AssetRow/AssetRow.tsx` + `AssetRow.module.css`: three-column row (icon, label, action), readonly variant, focus/active states.
   - `components/Tabs/Tabs.tsx` + `Tabs.module.css`: roles/ARIA (`tablist`, `tab`, `tabpanel`), `.is-active` styling, keyboard focus-visible outline.
   - Optional `components/Glow/Glow.tsx` + `Glow.module.css`: underlay glow with correct z-index and positioning.

3) Behavior rewrites (non-visual)
   - Tabs: React state drives active tab; set `aria-selected`, `aria-controls`, toggle `hidden`; keep IDs stable.
   - Number formatting: implement pure utility reproducing sandbox regex (commas for thousands, preserve decimals, single space before asset name).
   - Connect/disconnect: use parent-provided props to read/write `sessionStorage('wallet:address')` (keep current prod behavior).

4) Parity harness & visual checks
   - Add `web/src/app/dev/wallet/page.tsx` rendering the Wallet with mock props for isolated dev.
   - Add `web/src/app/dev/wallet-compare/page.tsx` showing side-by-side: iframe with `public/dev/ui/wallet/index.html` vs React Wallet component. Provide viewport toggles (320/360/390/414/420).
   - Optional: lightweight screenshot capture (Playwright/Puppeteer) to generate local images for manual visual compare (no CI gate initially).

5) Integration in runtime
   - Replace the inline wallet scaffold in `web/src/app/page.tsx` with `<Wallet .../>` once parity is confirmed in the compare harness.
   - Prop interface: `address`, `balances` ({ ton: number, usdt: number, coins: number, tickets: number }), callbacks `onConnect`, `onDisconnect`.

6) Styling/tokens guardrails
   - Define wallet-scoped CSS variables within the wrapper to mirror sandbox tokens: `--bg`, `--fg`, `--muted`, `--accent`, `--tab-active`, `--card-border`.
   - Preserve adjacency-dependent spacing by matching DOM shape where needed or by converting to explicit margins inside modules.
   - Maintain `container-type: inline-size`, `aspect-ratio` usage, safe-area padding, and z-index layering for glow/panels.

7) Documentation & changelog
   - Update `docs/app-overview.md`: add a Wallet section (production mirrors sandbox visuals; locations for components/assets; dev routes).
   - Update `docs/UI-mocks-wireframes/wireframes/wallet.md`: note production matches sandbox design.
   - Append a line to `CHANGELOG.md` on completion:
     - `| UI-WALLET-PROD-0001 | Ported Wallet UI from sandbox to production |`

## Acceptance criteria
- Side-by-side at 320/360/390/414/420 widths shows no perceivable visual differences (CTA frames, strokes, shadows, spacing, icons).
- No horizontal scroll; bottom nav is not overlapped due to safe-area padding.
- Tabs render active state and focus-visible outlines identically; panels switch as expected; ARIA attributes correct.
- Asset paths and casing verified; icons/frames load without 404s.

## Risks & mitigations
- Asset path/case mismatch → preserve original file names; add pre-merge check and validate in compare harness.
- Font loading timing → preload or early import; verify no fallback font metric shifts in harness.
- CSS leakage/drift → CSS Modules and wallet-scoped tokens; avoid global overrides.
- Adjacency selectors → replicate DOM structure or encode explicit margins to avoid relying on sibling combinators.

## Rollout
- PR 1: assets + components + dev wallet + compare harness (no mount in app).
- Review parity via harness; resolve drift.
- PR 2: mount in `page.tsx`, update docs and changelog.
