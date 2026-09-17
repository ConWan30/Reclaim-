<p align="center">
  <img src="assets/brand/reclaim-mark.svg" width="180" alt="ReClaim logo" />
</p>

<h1 align="center">ReClaim</h1>
<p align="center"><strong>Real recovery. Lasting impact.</strong></p>
<p align="center">Evidence-driven infrastructure for verified material recovery.</p>

---

## What ReClaim is

ReClaim helps communities prepare, verify, and account for physical material recovery. The first pilot is focused on glass beverage containers in Morehouse Parish, Louisiana.

A barcode identifies a product SKU. It does **not** prove that a unique physical container was recycled, and a scan never creates spendable value. ReClaim keeps identification, physical verification, and rewards deliberately separate.

```text
SCAN → IDENTIFIED → ELIGIBILITY_CHECKED → PENDING
     → PHYSICALLY_VERIFIED → REWARDED
```

## Core guarantees

- **Physical recovery is authoritative.** Recovery is established by approved facility/operator evidence, not by a consumer scan or AI output.
- **AI observes; it does not authorize.** Shadow reconciliation can assess evidence and surface discrepancies, but cannot verify recovery or create rewards.
- **Fail closed.** Unknown eligibility, missing evidence, and ambiguous observations do not become positive claims by default.
- **Auditable by design.** Recovery evidence and reward settlement are attributable and designed for append-only auditability.
- **No double rewards.** Closed or redeemed claims cannot be rewarded twice.

## Recovery Evidence Graph

ReClaim connects observations without confusing them with authority:

```text
observation
   ↓
product hypothesis → jurisdiction → claim → manifest
                                      ↓
                            facility observation
                                      ↓
                               recovery event
                                      ↓
                                  receipt
                                      ↓
                                  reward
```

AI-derived observations remain non-authoritative. Authoritative recovery evidence must be attributable to an approved physical verifier.

## AI Recovery Witness

The AI layer asks a narrow question: **does the evidence surrounding a recovery event coherently support what is being claimed?**

It can compare product identity, material, count, weight, timestamps, manifest history, and facility observations. Contradictions route to review rather than becoming accusations or automatic denials. The current reconciler operates in shadow mode.

Evaluation is safety-first. ReClaim measures false clears, discrepancy-detection recall, unnecessary reviews, count error, insufficient evidence, and performance by capture conditions. Ground truth must come from independent facility evidence or a controlled labeled dataset—AI cannot label itself.

## Pilot

The initial field-validation target is a small Morehouse Parish glass recovery pilot with a participating recycler, sponsor, and real residents. The system remains dormant until legitimate participants, physical evidence, and funding exist; synthetic activity is not substituted for field validation.

See [`docs/PILOT.md`](docs/PILOT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/AI_ARCHITECTURE.md`](docs/AI_ARCHITECTURE.md), and [`docs/SHADOW_EVALUATION.md`](docs/SHADOW_EVALUATION.md).

## Development

```bash
npm install
npm test
```

Supabase migrations and Edge Functions live under `supabase/`. Domain and evaluation logic live under `src/`, with tests under `tests/`.

## Project status

ReClaim is under active development and field-validation preparation. A scan is not proof of recycling, AI output is not physical verification, and pending/estimated value is not a verified reward.

---

<p align="center"><strong>People + technology + accountability = real change.</strong></p>
