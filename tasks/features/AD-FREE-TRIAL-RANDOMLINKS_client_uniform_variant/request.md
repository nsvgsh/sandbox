## AD-FREE-TRIAL-RANDOMLINKS — Client uniform random variant selection (request)

### What
Enable the client to uniformly pick a variant id from a predefined list of partner links for the "free_trial" offer family, pass that variant to the existing backend redirect endpoints, and let the server build/validate/log the final URL. If the provided variant is missing/invalid, the server must fall back to a non-randomized default link that is not part of the randomized set. No analytics changes. No kill-switch.

### Why
- Interchange external partner links without changing the in-game process (level-up modal open + Earn claim).  
- Keep security and readiness intact by continuing to route through server redirects (host allowlist, ad_event logging, intent-based readiness).  
- Allow operational control of the variant list via config, while selecting uniformly per call on the client for simple distribution.

### Scope
- In:
  - Private config: catalog of variants (ids, url_template, allowed_hosts, optional source).  
  - Public snapshot: list of variant ids only.  
  - Backend redirect endpoints accept optional `variant` query param; validate variant and enforce host allowlist; otherwise fall back to a single default link outside the randomized set; continue existing logging and responses.  
  - Client (level-up modal prefetch and Earn CTA): uniform random selection per call among available ids; pass `variant` to redirects; open returned URL exactly as today.  
  - No analytics schema or event changes.
- Out:
  - Weighted/sticky assignment, experiment framework, or per-user bucketing.  
  - Kill-switch flags.  
  - Direct client opening of absolute URLs bypassing redirect.  
  - Any changes to claim semantics or TTL (free_trial stays no-TTL).

### Acceptance criteria (high-level)
1) With variants configured and exposed, the client uniformly selects an id per call and receives a valid redirect URL; link opens successfully in Telegram webview and desktop browser.  
2) If the client sends an unknown/missing variant, the server returns the fallback link (outside the randomized set), not a 4xx, and logging/readiness continue to work.  
3) Host allowlist is enforced server-side for each variant; mismatches do not break UX (fallback is used).  
4) Earn readiness and claim for free_trial tasks remain unchanged and succeed post-redirect.  
5) With an empty public variants list, the system behaves identically to today (no variant parameter; server returns fallback link).  
6) No new analytics events or fields are introduced.


