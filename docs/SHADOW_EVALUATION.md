# Shadow Reconciliation Evaluation

This harness evaluates ReClaim's non-authoritative reconciliation output against independently labeled physical-recovery evidence.

## Safety priority

The primary safety metric is **false-clear rate**: discrepant physical evidence that the shadow reconciler labels `consistent`. A clear result remains an observation and never establishes physical recovery, but false clears are still the highest-priority model-quality failure because they would make future reviewer assistance unsafe.

`insufficient_evidence` is never counted as a clear. Empty denominators produce `null`, not a fabricated zero or perfect score.

## Metrics

- false-clear rate
- discrepancy-detection recall
- review precision
- unnecessary-review rate
- mean absolute count error
- insufficient-evidence count

## Labeling protocol

Ground truth must come from independently established facility evidence or a controlled labeled dataset. AI output must not label itself. Each case should preserve enough provenance to reproduce the comparison, including dataset version, capture conditions, and reconciler version.

For the Morehouse Parish glass pilot, stratify results where data permits by lighting, capture device, container condition, batch size, and material ambiguity. Small strata must be reported as small samples rather than generalized.

## Promotion gate

There is no automatic promotion from shadow mode. A future proposal to use reconciliation for reviewer assistance must present the labeled results, especially false clears, and undergo explicit review. This evaluation harness cannot change claim state, create recovery events, activate programs, or create rewards.
