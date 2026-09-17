export type ShadowDisposition = "consistent" | "review" | "insufficient_evidence";
export type GroundTruth = "consistent" | "discrepant";

export interface LabeledShadowCase {
  id: string;
  truth: GroundTruth;
  disposition: ShadowDisposition;
  claimedCount?: number;
  observedCount?: number;
}

export interface ShadowEvaluation {
  total: number;
  labeledDecisions: number;
  insufficientEvidence: number;
  trueClear: number;
  falseClear: number;
  trueReview: number;
  unnecessaryReview: number;
  falseClearRate: number | null;
  discrepancyDetectionRecall: number | null;
  reviewPrecision: number | null;
  unnecessaryReviewRate: number | null;
  meanAbsoluteCountError: number | null;
}

const ratio = (numerator: number, denominator: number): number | null =>
  denominator === 0 ? null : numerator / denominator;

export function evaluateShadowCases(cases: readonly LabeledShadowCase[]): ShadowEvaluation {
  let trueClear = 0;
  let falseClear = 0;
  let trueReview = 0;
  let unnecessaryReview = 0;
  let insufficientEvidence = 0;
  const countErrors: number[] = [];

  for (const item of cases) {
    if (item.disposition === "insufficient_evidence") {
      insufficientEvidence += 1;
    } else if (item.disposition === "consistent") {
      if (item.truth === "consistent") trueClear += 1;
      else falseClear += 1;
    } else if (item.truth === "discrepant") {
      trueReview += 1;
    } else {
      unnecessaryReview += 1;
    }

    if (Number.isFinite(item.claimedCount) && Number.isFinite(item.observedCount)) {
      countErrors.push(Math.abs(item.claimedCount! - item.observedCount!));
    }
  }

  const discrepantDecisions = trueReview + falseClear;
  const clearDecisions = trueClear + falseClear;
  const reviewDecisions = trueReview + unnecessaryReview;
  const consistentDecisions = trueClear + unnecessaryReview;

  return {
    total: cases.length,
    labeledDecisions: cases.length - insufficientEvidence,
    insufficientEvidence,
    trueClear,
    falseClear,
    trueReview,
    unnecessaryReview,
    falseClearRate: ratio(falseClear, clearDecisions),
    discrepancyDetectionRecall: ratio(trueReview, discrepantDecisions),
    reviewPrecision: ratio(trueReview, reviewDecisions),
    unnecessaryReviewRate: ratio(unnecessaryReview, consistentDecisions),
    meanAbsoluteCountError: countErrors.length ? countErrors.reduce((sum, value) => sum + value, 0) / countErrors.length : null,
  };
}
