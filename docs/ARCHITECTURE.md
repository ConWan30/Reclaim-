# ReClaim MVP Architecture

## Proposed stack
- Next.js + TypeScript mobile-first PWA
- Supabase Auth + PostgreSQL
- Row Level Security for user/facility boundaries
- Server-side eligibility and verification transitions
- Camera barcode scanning in the web client

## Trust boundaries
### Consumer client
May request identification, create pending claims, build manifests, and view balances. It cannot mark recovery verified or create reward ledger credits.

### ReClaim backend
Owns eligibility evaluation, state transitions, deduplication controls, recovery reconciliation, receipt creation, and ledger writes.

### Facility/operator
May verify a presented manifest only when authenticated and authorized for that facility/program. Verification records method, operator, facility, timestamp, accepted counts/weight, and exceptions.

### Administrator
May manage product/rule/facility data. Overrides require an audit event and must never erase prior evidence.

## State machine
Suggested claim states:

`scanned -> identified -> pending -> manifested -> submitted -> verified -> rewarded`

Terminal/exception states:

`rejected`, `expired`, `cancelled`, `review_required`

Transitions to `verified` and `rewarded` are server-controlled.

## Reward accounting
Use an append-only ledger. Do not store a mutable wallet balance as the financial source of truth. Pending value is a projection from eligible pending claims. Verified/rewarded value is derived from ledger entries backed by recovery evidence.

## First anti-fraud controls
- authenticated claim ownership
- server timestamps and generated IDs
- rate limits for scans/claims
- duplicate/replay detection at manifest and recovery level
- facility-scoped operator authorization
- idempotency keys for verification/reward operations
- immutable linkage from reward -> recovery event -> manifest/claims
- anomaly flags for impossible count/weight combinations
- explicit audit trail for overrides

## Privacy principle
Collect the minimum user/location data required for eligibility, fraud prevention, settlement, and pilot reporting. Aggregate pilot analytics by default; do not expose individual recycling histories to sponsors.

## Expansion
The evidence model should remain material-agnostic even while the pilot UI supports only glass beverage containers. Later material types can add verification strategies without weakening the core invariant that physical recovery is required for verified credit.
