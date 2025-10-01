# Implementation Plan — UI-EARN-CLAIM-0001 (Approach B: Extract shared ModalCard)

## Current situation
- LevelUp modal implements its own overlay and card layout using `web/src/ui/Modal/Modal.module.css` and `LevelUpModal` component.
- Task-claim modal is an inline component in `web/src/app/page.tsx` with ad-hoc styles and minimal layout.
- Wallet `AssetRow` exists and is suitable to display reward items.

## Approaches
🟢 Approach A — Reuse existing LevelUp card directly in page.tsx
- Pros: Fast, minimal change. Cons: Cross-file coupling; not DRY.

🟢 Approach B (Recommended) — Extract shared `ModalCard` and refactor both modals to use it
- Pros: Single source of truth for modal layout and behavior; consistent visuals; easier future mods.
- Cons: Touches LevelUp modal; requires careful regression testing.

🟢 Approach C — Keep Task-claim local, import only `AssetRow`
- Pros: Safest; smallest change. Cons: Doesn’t unify card visuals.

## Detailed plan (Recommended: Approach B)
1) Create `web/src/ui/Modal/ModalCard.tsx`
   - Props: `title?: string; headline?: string; onClose?: () => void; children?: React.ReactNode; actions?: React.ReactNode; twoRows?: boolean`
   - Structure:
     - Overlay div: `className={styles.overlay}`
     - Card container: `className={twoRows ? styles.card + ' ' + styles.cardTwoRows : styles.card}`
     - Header area: optional `headline` (small), `title` (large) slots
     - Content area: `children` (scrollable area)
     - Actions area: optional `actions`
     - Backdrop click closes when clicking overlay; stopPropagation on card.
   - Reuse classes from `Modal.module.css` and extend if needed (content wrapper, simple title/headline classes if reusing existing ones is not suitable).

2) Update/extend `web/src/ui/Modal/Modal.module.css`
   - Add optional utility classes if needed: `.content`, `.titleSimple`, `.headlineSimple` (match Lilita One typography), spacing tokens.
   - Ensure accessibility-friendly focus styles remain.

3) Refactor `LevelUpModal` to consume `ModalCard`
   - Replace outer overlay/card markup with `ModalCard`.
   - Pass existing header (headline, shield+level, title) into header slot, rewards grid as `children`, and CTAs into `actions`.
   - Keep behavior and aria attributes.

4) Create `web/src/ui/Modal/TaskClaimModal.tsx`
   - Props: `{ rewardPayload: Record<string, unknown> | null; onClose: () => void }`.
   - Map payload → rows:
     - Coins: `/ui/wallet/Icon_Golds.Png`, label `formatAssetLabel("<n> Coins")`.
     - Tickets: `/ui/header/Whisk_Purple_Ticket.png`, label `formatAssetLabel("<n> Tickets")`.
     - Unknown keys ignored in v1; show empty state if none.
   - Render inside `ModalCard` with title "Congratulations!"; content is a `<ul>` of `AssetRow` with `readonly` set; actions: one primary Close button.

5) Integrate into `web/src/app/page.tsx`
   - Replace inline `TaskClaimModal` with imported `TaskClaimModal` component.
   - Pass `rewardPayload` and `onClose` as before.

6) Accessibility & behavior
   - Keep `role="dialog"`, `aria-modal="true"` on overlay.
   - Ensure click outside closes; inside card doesn’t.
   - Initial focus on Close button; Escape to close (optional small enhancement).

7) QA & visual checks
   - Compare LevelUp modal before/after: sizes, paddings, text scales, rewards layout, CTAs.
   - Verify Earn claim modal uses the same card styling and lists rows correctly on small screens; scroll if overflow.

8) Documentation impact
   - `docs/app-overview.md`: note that Earn claim modal reuses shared `ModalCard` and `AssetRow`.
   - `CHANGELOG.md`: add a line under features.

## Edge cases
- Empty or malformed `rewardPayload`: show a single readonly row "No rewards" with a generic icon, or render a small muted text.
- Extremely large numbers: rely on `formatAssetLabel` thousand-separator formatting.

## Acceptance Criteria
- Both LevelUp and Task-claim modals use `ModalCard` baseline layout and overlay.
- Task-claim renders rewards via `AssetRow` with correct labels and icons, no actions per row.
- No functional regressions to LevelUp modal CTAs or layout.
