# OFFERS-REFRESH-0002 — Earn flicker due to repeated tasks refresh

## Problem
After a level-up, task cards in the Earn tab flicker. In DevTools Network, `/api/v1/tasks` requests are sent repeatedly while the Offers tab is open.

## Root Cause Analysis
- The ad-unlock pruning effect runs every 500ms and always returns a new `adUnlocks` object, even when nothing expires.
- This changes the identity of `readUnlockForTask` → `loadTasks` → `loadTasksCb`, retriggering the “enter Offers” refresh effect and causing repeated `/api/v1/tasks` calls and UI flicker.

## Proposed Fix
- Modify the pruning effect to return the previous `adUnlocks` reference when no keys actually expire. Only update state when a real change occurs (prune-only update).
- This stops unnecessary re-renders and prevents repeated task refetches, aligning behavior with docs (no periodic polling; refresh on tab entry, level change, and claim only).

## Acceptance Criteria
- While Offers is open and no unlocks expire, no repeated `/api/v1/tasks` requests occur.
- Tasks still refresh on Offers entry, level change, and after claim.
- No visible flicker of Earn cards under normal operation.


