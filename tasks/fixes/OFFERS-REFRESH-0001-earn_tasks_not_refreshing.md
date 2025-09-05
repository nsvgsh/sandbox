# OFFERS-REFRESH-0001 — EARN tasks not refreshing

## Problem
After leveling up and navigating to EARN, the "Available" and "Completed" lists show empty, and no `/api/v1/tasks` request is made. From the user’s perspective, offers are missing even though their level should unlock them.

## Root Cause Analysis
- The frontend fetches tasks only once during initial bootstrap (and after a claim), but not on EARN tab entry nor when the user’s `level` changes. The tasks state therefore remains stale and continues to reflect the gating computed at the previous level.

## Proposed Fix
- Trigger a guarded refresh of tasks when:
  - The user enters the EARN section (tab switch to `activeSection === 'offers'`).
  - The user’s `level` changes (detected via `counters.level`).
- Add a minimal loading indicator while tasks refresh is in flight.
- Prevent duplicate concurrent loads with a simple in-flight guard.

## Acceptance Criteria
- Opening EARN issues a `/api/v1/tasks` request (once per entry) and lists reflect current level gating.
- After a level-up, switching to EARN refreshes tasks and shows newly available offers.
- No visible flicker; loading indicator appears only during fetch.


