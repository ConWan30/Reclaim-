# Morehouse Parish Glass Pilot

## Status
Configuration-ready, not financially active.

ReClaim must not invent a reward rate or imply that printed out-of-state deposit markings are redeemable in Louisiana. A pilot becomes reward-active only after a real funding source, amount, budget/cap, dates, eligible material, participating facility, and settlement process are approved and entered as program data.

## Activation gates
1. Named funding source and authorized budget.
2. Explicit reward rate in cents per verified container (or another documented formula).
3. Start/end dates and participant/facility caps where applicable.
4. At least one participating facility with an authorized operator.
5. Physical verification procedure documented and tested.
6. Duplicate/replay and idempotency tests pass.
7. RLS/security review passes.
8. Production smoke test proves scan -> pending -> manifest -> physical verification -> reward, with direct client verification/reward attempts denied.

## Pilot success metrics
- verified glass containers recovered
- accepted vs rejected/contaminated count
- duplicate/replay attempts blocked
- cost per verified container
- verification throughput/time
- participant return rate
- discrepancy between pre-registered and physically accepted containers

## Legal/economic labeling
The UI must label values by source: statutory deposit/refund where legally applicable, versus ReClaim/local sponsor incentive. Pending estimates are not earned balances. Only physically verified recovery under an active program can produce a reward ledger entry.
