# ReClaim Frontend Foundation

`web/` is the dependency-free browser application foundation for the Morehouse Parish pilot. It uses the committed ReClaim brand assets and the production Supabase project through its **publishable** browser key only. No secret/service-role credential belongs in this directory.

## Application surfaces

- Authentication: sign in, account creation, sign out.
- Dashboard: scans captured, evidence created, verification backlog, authoritative verified recoveries, capture-to-verification conversion, recent claims.
- My Activity: collection manifests.
- Evidence: observation and model-backed evidence, with AI confidence explicitly separated from verification.
- Impact: authoritative `recovery_events` only.
- Rewards: `reward_ledger` only.
- Scan capture: creates a `scanned` claim under existing RLS; it does not identify, verify, recover, or reward the item.
- Collection creation: creates an `open` manifest under existing RLS.

## Backend wiring

The browser uses Supabase Auth and the Data API with the signed-in user's JWT. Existing RLS policies remain the authorization boundary:

- `container_claims`: read own; insert own only in `scanned` with product/jurisdiction unset.
- `collection_manifests`: read own; insert own only as `open`.
- `manifest_items`: read/insert only through owned eligible manifests/claims.
- `evidence_observations`: read own; no browser write path.
- `recovery_events`: read only when connected to the user's manifest; no browser write path.
- `reward_ledger`: read own; no browser write path.

The gateway also exposes authenticated Edge Function invocation for `identify-claim`, `submit-manifest`, and future trusted transitions. The current identify/submit functions intentionally return `transition_not_enabled` rather than weakening the database boundary. UI work must preserve that fail-closed behavior until the trusted transition path is implemented.

## Authority rules

The browser must never calculate verified recovery from scan count, evidence count, AI confidence, claim state alone, or manifests. A claim is presented as a verified recovery only when its manifest resolves to an authoritative recovery event. If the recovery-event query fails, dependent UI renders **Unavailable**, not zero and not a scan-derived fallback.

A successful authoritative query returning no events may render zero.

## Running locally

Serve the repository root with any static HTTP server and open `/web/`. Do not open the HTML with `file://`, because browser API/CORS behavior differs from a real origin.

The web foundation has no npm runtime dependency. CI validates its JavaScript syntax through `npm run check:web`, while the existing TypeScript domain tests continue to protect the kernel and dashboard projection contracts.

## Deployment readiness

Before public deployment:

1. Configure the hosting origin in Supabase Auth redirect/site URL settings if email confirmation or OAuth flows require it.
2. Confirm Edge Functions called by browsers return appropriate CORS headers before exposing their actions in the UI.
3. Run an authenticated production smoke with a legitimate participant and owned records. Do not fabricate recovery events or rewards to make the smoke pass.
4. Keep physical verification and settlement actions operator/backend-only.
