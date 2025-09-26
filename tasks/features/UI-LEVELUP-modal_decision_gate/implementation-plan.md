## Architectural Analysis
- Add `levelModalDecision` state and a guard ref keyed by `leveledUp`.
- Effect depends only on `leveledUp`, reads a snapshot of tasks; if needed, performs a one-off fetch without mutating global tasks.
- While decision is `unknown`, render nothing; then render chosen modal once.

## Task List
1) Add `decisionForLevelRef` guard and `levelModalDecision` state.
2) Implement one-shot decision logic; remove `tasks` from effect deps.
3) Keep regular/FT modals mutually exclusive; suppress bonus flow for FT.

## Documentation Impact
- app-overview: stability note for level-up flow; decision-first rendering.


