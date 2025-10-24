## Architectural Analysis

Goal: Randomize partner link selection on the client uniformly per call, while keeping server as the source of truth for URL construction, host allowlisting, and ad_event logging (for readiness). Provide a non-random fallback link outside the randomized set. No analytics changes; no kill-switch.

Key constraints from current codebase:
- Redirect endpoints build URLs from config and enforce host restrictions; they also log ad_events required for free_trial readiness.  
- UI is keyed on `kind === 'free-trial'` and should remain unchanged; client only adds a `variant=<id>` hint when calling redirects.  
- Readiness for free_trial tasks is intent-based and has no TTL; must remain unchanged.

Design decisions:
- Server keeps private catalog: `free_trial_variants: [{ id, url_template, allowed_hosts[], source? }]`.  
- Client receives only IDs via public snapshot: `freeTrial.variants: string[]`.  
- Client uniformly picks an id per call (modal prefetch and earn CTA) and passes `variant` to redirects.  
- Server validates `variant`; on any error or mismatch, server returns a separate fallback template (outside the randomized set), enforcing its own allowlist.  
- No analytics changes; existing logging flows remain intact.

## Task List
1) Config — Add server-private variants and a dedicated fallback template (not in variants).  
2) Config — Expose public variant id list in the snapshot; IDs only.  
3) Backend — Update `/api/v1/offer/free-trial/[taskId]/redirect` and `.../modal-redirect` to accept optional `variant`:
   - Resolve variant → build URL with `{CLICKID}` and `{SOURCE}`; enforce variant-level host allowlist.  
   - On unknown/invalid variant or host mismatch → build URL from fallback template and enforce fallback allowlist.  
   - Continue logging ad_events and response semantics unchanged.  
4) Client — In level-up modal prefetch and Earn CTA:
   - Read `freeTrial.variants`. If non-empty, uniformly select one id and append `variant=<id>` to redirect calls; otherwise omit.  
   - Open returned URL as today; no UI text changes.  
5) Validation — Staging tests: variants present (randomized), empty list (fallback), unknown id (fallback), host mismatch (fallback), claim flow intact.  
6) Documentation — Update `docs/api-contracts.md` and `docs/app-overview.md`: describe `variant` hint and fallback behavior; document that URLs are server-validated with host allowlists and that analytics are unchanged.

## Implementation Details

Configuration (server-private):
- `free_trial_variants` array with entries:  
  - v1: https://x.trc85.com/aff_c?offer_id=2651&aff_id=4113&url_id=8834&source={SOURCE}&aff_sub={CLICKID}&pl=9  
  - v2: https://x.trc85.com/aff_c?offer_id=2651&aff_id=4113&url_id=10273&source={SOURCE}&aff_sub={CLICKID}&pl=42  
  - v3: http://x.trc85.com/aff_c?offer_id=882&aff_id=4113&url_id=8391&source={SOURCE}&aff_sub={CLICKID}&pl=54  
  - v4: http://x.trc85.com/aff_c?offer_id=882&aff_id=4113&url_id=15082&source={SOURCE}&aff_sub={CLICKID}&pl=192  
- Each variant `allowed_hosts = ['x.trc85.com']`.  
- Fallback template: existing `free_trial_url_template` (must not be included in variants).  

Backend endpoints:
- Parse optional `variant` query param.  
- If matched: use that variant; else use fallback.  
- URL substitution: `{CLICKID}` with uuidv4; `{SOURCE}` with current `free_trial_source`.  
- Host enforcement: ensure final URL hostname matches a suffix in the selected entry's `allowed_hosts`.  
- Logging: unchanged; provider remains within current semantics; no new fields.  
- Response: unchanged; preserves `?format=json` behavior.

Client changes:
- Read `freeTrial.variants` from snapshot.  
- Uniform selection per call: `idx = floor(Math.random() * variants.length)`; `variant = variants[idx]`.  
- Append `variant` to redirect calls for both Earn CTA and level-up modal prefetch.  
- Open URL as today.

Edge cases:
- Public variants absent/empty → client omits `variant` → server uses fallback.  
- Unknown `variant` id → server uses fallback.  
- Host mismatch after substitution → server uses fallback.  
- http variants: some environments may block; server does not error; client open may be blocked by platform — acceptable per constraints; fallback still available.

## Documentation Impact
- Update `docs/api-contracts.md` to mention optional `variant` hint and fallback semantics.  
- Update `docs/app-overview.md` to state client uniform random selection and server validation.  
- No analytics documentation changes.


