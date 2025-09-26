## Request: Level-Up Modal Decision Gate

### WHAT
- Decide which level-up modal to render (regular vs Free Trial) exactly once per level-up, without flicker.

### WHY
- Prevent UI thrash from re-computations and data races; keep UX stable.


