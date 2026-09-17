# ReClaim Dashboard Contract

The dashboard is a projection over ReClaim's existing domain kernel. It is not a second state machine.

## Authority boundary

- `claim_state` is lifecycle truth.
- Evidence observations describe what was observed or assessed. Observation evidence cannot establish physical recovery.
- Authoritative recovery evidence referencing a recovery event establishes physical verification for dashboard purposes.
- Reward settlement remains separate from verification.
- Dashboard labels are projections only.

A scan identifies or observes an item. It is never presented as recovery, recycling, verified impact, or earned value.

## Status projection

| Kernel / evidence condition | Dashboard label | Recovery? |
| --- | --- | --- |
| `scanned` | Scan Captured | No |
| `identified` | Item Identified | No |
| pending workflow, no evidence | Awaiting Verification | No |
| pending workflow with evidence | Evidence Available | No |
| `review_required` | Needs Review | No |
| `rejected` | Not Verified | No |
| `expired` | Expired | No |
| `cancelled` | Cancelled | No |
| `verified` + authoritative recovery evidence | Verified Recovery | Yes |
| `verified` without authoritative recovery evidence | Verification Unavailable | No |
| `rewarded` + authoritative recovery evidence | Rewarded | Yes |

Evidence availability does not imply AI involvement. Model confidence is shown only when an actual model-backed observation exists and is never described as verification confidence.

## Metric rules

**Scans Captured** is observation volume only.

**Verified Recoveries** is available only from an authoritative recovery source. A successful authoritative query returning no qualifying events is `0`; a failed, missing, or unresolved authoritative source is `Unavailable`.

**Reached Verification** is a capture-cohort conversion metric: unique claims from the selected capture cohort that subsequently reach authoritative recovery, divided by all claims in that capture cohort. It is not a parish recycling rate or a measure of all containers sold.

**Verified Participants** means unique participants with at least one qualifying authoritative recovery in reporting scope. Registration, scanning, evidence creation, and manifest submission do not qualify a participant.

**Verified Material Mass** must come from authoritative physical recovery measurements. Estimated mass must remain separately labeled.

**Estimated CO2e Avoided** must use verified recovery inputs, remain labeled Estimated, and identify its methodology/version. Without methodology provenance it is Unavailable.

**Rewards** come from settlement truth and must reference eligible verified recovery. Pending estimates must never be labeled earned or verified.

## Rendering contract

Components consume dashboard projections rather than deciding authority from raw rows. Metric rendering has two legal states:

1. `available` — render the authoritative value, including a genuine zero.
2. `unavailable` — render `Unavailable` and never substitute zero or a non-authoritative count.

Color is supplementary. Every state has a textual label, charts require text equivalents, and screen-reader labels must preserve the distinction between observations and verified recovery.

The persistent disclosure is: **A scan is an observation, not a recovery. Only material confirmed through an authorized physical verification process is counted as verified recovery.** This disclosure supports correct component semantics; it does not excuse misleading component copy or icons.
