# ReClaim AI Architecture

## Principle

AI is an observation and reconciliation layer. It never establishes physical recovery, eligibility, or reward entitlement by itself.

A model assertion is evidence about an observation, not proof that recycling occurred. Only an authorized physical recovery event may unlock deterministic settlement.

## Recovery Evidence Graph

ReClaim models recovery as a graph of attributable observations and authoritative events:

`observation -> product hypothesis -> jurisdiction -> claim -> manifest -> facility observation -> recovery event -> receipt -> reward`

Every graph edge records provenance. AI-derived edges and authoritative edges are deliberately different types.

### AI observation provenance

An AI observation should retain:

- model provider and model identifier
- model version
- observation type
- confidence/calibration value when meaningful
- hashes or stable references for inputs
- timestamp
- structured result and reason codes
- supersession/review status

AI observations are append-only. A newer inference supersedes rather than silently rewrites an older inference.

### Authoritative provenance

An authoritative recovery edge records:

- facility identity
- authorized operator or approved automated verifier identity
- verification method
- manifest/recovery identifiers
- physical evidence references
- timestamp
- immutable recovery receipt

AI cannot promote its own edge into an authoritative edge.

## AI capabilities

### 1. Container intelligence

Fuse barcode, OCR, label fragments, shape and material observations to propose product identity when a container is damaged or the barcode is incomplete. Unknown or low-confidence identity fails closed to review.

### 2. Recovery reconciliation

Compare manifest claims with physical observations such as count, material mix, sampled product identities and measured weight. Produce a structured consistency assessment, never a reward decision.

### 3. Anomaly intelligence

Detect patterns such as replayed imagery, implausible collection velocity, repeated evidence, unusual count-to-weight relationships, cross-account/facility anomalies and persistent reconciliation mismatches. An anomaly routes to review; it is not automatically treated as fraud.

### 4. Adaptive evidence requests

When evidence is insufficient, select the next useful observation: another image, weight, recount, barcode sample or operator review. Missing evidence is never synthesized.

### 5. Recovery-network intelligence

Use verified recovery history to identify contamination patterns, facility bottlenecks, geographic recovery gaps and intervention opportunities. Analysis must distinguish verified outcomes from AI estimates.

## Counterfactual Recovery Intelligence

A later research layer can estimate whether verified recovery was plausibly incremental to a ReClaim intervention. This must be expressed as statistical analysis with uncertainty, not as a fact attached to an individual recovery event. It must never change the underlying verified recovery count.

## First AI pilot

The first pilot is **evidence reconciliation in shadow mode** for Morehouse Parish glass beverage containers.

The model receives only evidence already collected by the workflow and emits a non-authoritative assessment:

- observed material
- approximate count or count interval
- sampled identity matches
- count/weight consistency when weight exists
- evidence completeness
- discrepancy reason codes
- review recommendation

The assessment cannot transition claim state, verify a manifest, activate an incentive, or create a reward. Human/facility verification remains authoritative.

### Initial evaluation

Before AI influences operator workflow, measure against labeled physically verified sessions:

- material classification precision/recall
- count error distribution
- discrepancy detection precision/recall
- false-clear rate (highest-priority safety metric)
- unnecessary-review rate
- latency and inference cost
- performance by lighting/device/container condition

Do not enable automatic verification from these results. The purpose is to determine whether AI observations are useful enough to assist authorized verifiers.

## Fail-closed rules

1. AI output never creates spendable value.
2. AI output never substitutes for a physical recovery event.
3. Missing evidence remains missing.
4. Low confidence or contradictory evidence routes to review.
5. Model/version/input provenance is retained for every inference.
6. AI observations are append-only and auditable.
7. Deterministic jurisdiction, incentive and settlement rules remain outside the model.
8. Model upgrades are evaluated against labeled recovery evidence before use in operator workflow.
9. The pilot remains Morehouse/glass scoped until explicitly expanded.
10. Counterfactual estimates never rewrite verified recovery facts.
