# ReClaim

**Verified recovery, from claim to receipt.**

ReClaim is a verified container recovery platform designed to connect consumer preparation, physical recycler verification, and auditable incentives without confusing a barcode scan with proof of recycling.

The first pilot is focused on glass beverage containers in Morehouse Parish, Louisiana. ReClaim is being built as infrastructure that can later support additional materials and recovery programs while preserving the same evidence boundary.

## The core invariant

> A scan identifies a container SKU. It does not prove that a unique physical container was recycled, and it never creates spendable value by itself.

The canonical lifecycle is:

`SCAN → IDENTIFIED → ELIGIBILITY_CHECKED → PENDING → PHYSICALLY_VERIFIED → REWARDED`

Physical facility verification is authoritative. Pending claims, computer-vision observations, OCR, barcode matches, and AI reconciliation remain evidence until an authorized recovery process establishes the physical event.

## How ReClaim works

Consumers identify eligible containers and build a collection manifest before arriving at a participating facility. The facility reconciles that manifest against physical material, records the recovery event, and produces an auditable receipt. Any incentive is settled only from verified recovery under an applicable funded program.

ReClaim deliberately separates three concepts that are often collapsed in recycling applications:

- **Identity** — what product or material appears to be present.
- **Recovery evidence** — observations supporting or contradicting a claim.
- **Authority** — the physical verification required before recovery or reward is established.

## AI Recovery Witness

AI in ReClaim is an evidence-reconciliation layer, not an authority. The shadow reconciler compares submitted and observed evidence, surfaces discrepancies and missing evidence, and writes non-authoritative observations to the Recovery Evidence Graph.

The evaluation system measures false clears, discrepancy-detection recall, unnecessary reviews, count error, and performance across capture conditions. AI cannot label its own evaluation ground truth, promote itself out of shadow mode, verify physical recovery, or create rewards.

## Recovery Evidence Graph

ReClaim models the chain from observation to settlement explicitly:

`observation → product hypothesis → jurisdiction → claim → manifest → facility observation → recovery event → receipt → reward`

AI-derived observations preserve provenance and remain non-authoritative. Authoritative recovery evidence is attributable to an approved facility/operator or an explicitly approved future verification mechanism.

## Fail-closed guarantees

- A scan never directly creates spendable value.
- Unknown eligibility never defaults to eligible.
- Printed deposit markings do not establish local entitlement by themselves.
- Missing evidence stays missing; the system does not synthesize it.
- Recovery and reward operations require explicit verified prerequisites.
- Closed or redeemed claims cannot be rewarded twice.
- AI observations cannot transition recovery state.
- Reward records must trace back to verified recovery and an applicable incentive rule.
- Administrative exceptions must remain explicit and auditable.

## Current status

The repository contains the fail-closed domain foundation, Supabase schema and security hardening, authenticated Edge gateways, a persistent Recovery Evidence Graph, a server-only non-authoritative observation writer, shadow reconciliation, and a versioned safety-evaluation framework.

The production pilot remains intentionally dormant until real-world prerequisites exist: legitimate participants, a participating recycler/facility and operator, independently labeled physical evidence, and a funded incentive program where rewards are offered. Synthetic data is not used to claim field validation.

## Repository map

```text
src/domain/              Core claim, reward, and evidence invariants
src/ai/                  Shadow reconciliation and evaluation logic
supabase/migrations/     Database schema and security migrations
supabase/functions/      Authenticated Edge gateways
supabase/seed.sql        Development seed data
tests/                   Domain and AI safety tests
docs/                    Product, architecture, pilot, AI, and evaluation docs
evaluation/              Versioned evaluation-dataset guidance
```

## Development

```bash
npm install
npm test
npm run typecheck
```

CI runs the TypeScript build and test suite for proposed changes.

## Pilot

The initial target is a small Morehouse Parish glass recovery pilot with a participating recycler, sponsor or funded incentive source, and a limited set of glass beverage containers. The objective is to measure verified recovery, contamination, reconciliation variance, operational throughput, false-clear behavior, and incentive economics before expanding scope.

See `docs/PILOT.md`, `docs/ARCHITECTURE.md`, `docs/AI_ARCHITECTURE.md`, `docs/SHADOW_EVALUATION.md`, and `docs/BRAND.md` for the working design.

## Project principle

**ReClaim rewards verified recovery—not the appearance of recovery.**
