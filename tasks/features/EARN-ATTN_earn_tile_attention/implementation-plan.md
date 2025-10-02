## Architectural Analysis
- Client-only snapshot diff for “new available tasks” using the existing `/api/v1/tasks` response. No backend changes.
- Bottom nav uses a Shadow DOM component `BottomNavShadow`; expose a prop to set a data-attribute for the `EARN` button and drive CSS animation in `/public/ui/bottomnav/bottomnav.css`.

## Task List
1) BottomNavShadow: add `earnAttention?: boolean` prop; set `data-attention="true"` on `button[data-key="offers"]` when true.
2) CSS: add a subtle shake animation for `button.imgBtn[data-key="offers"][data-attention="true"]` (wrap in prefers-reduced-motion guard).
3) page.tsx: compute newness:
   - Maintain last-seen available taskId set in `sessionStorage` per user.
   - When outside EARN, after tasks load, if `available_now \ last_seen` non-empty → set `earnAttention=true`.
   - On entering EARN, set `earnAttention=false` and persist `last_seen = available_now`.

## Documentation Impact
- None beyond CHANGELOG; behavior is intuitive.


