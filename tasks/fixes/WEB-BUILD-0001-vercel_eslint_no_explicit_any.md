# WEB-BUILD-0001 — Vercel deploy fails due to ESLint no-explicit-any

## Problem
Vercel deployment fails during `next build` at the ESLint/type-checking stage. Errors originate from `@typescript-eslint/no-explicit-any` in `web/src/ui/Clicker/RotatingTextRing.tsx` when assigning CSS custom properties on `style` using `as any`.

## Root Cause
`React.CSSProperties` doesn't accept arbitrary string keys, so the component was using `['--var' as any]` to set CSS variables. The project enforces strict TypeScript/ESLint rules (extends `next/core-web-vitals` and `next/typescript`), so `any` is disallowed and causes build failure on Vercel.

## Proposed Fix
Define a precise type for CSS custom properties and remove `any` usage:
- Create a `RingStyle` type that extends `React.CSSProperties` and whitelists the custom CSS variables (`--ring-size`, `--ring-opacity`, `--ring-font-size`, `--spin-duration`).
- Assign `styleVars` as `RingStyle` and set properties without `as any`.
- Optional: remove the unused `text` prop from `RotatingTextRing` to silence a warning.

## Acceptance Criteria
- `npm run build` succeeds locally and on Vercel without ESLint errors.
- No behavior or visual regressions in the clicker CTA ring.


