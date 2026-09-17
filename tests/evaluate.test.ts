import test from "node:test";
import assert from "node:assert/strict";
import { evaluateShadowCases } from "../src/ai/evaluate.js";

test("measures false clears separately from unnecessary reviews", () => {
  const result = evaluateShadowCases([
    { id: "a", truth: "consistent", disposition: "consistent", claimedCount: 10, observedCount: 10 },
    { id: "b", truth: "discrepant", disposition: "consistent", claimedCount: 10, observedCount: 8 },
    { id: "c", truth: "discrepant", disposition: "review", claimedCount: 10, observedCount: 9 },
    { id: "d", truth: "consistent", disposition: "review", claimedCount: 10, observedCount: 10 },
  ]);

  assert.equal(result.falseClear, 1);
  assert.equal(result.trueReview, 1);
  assert.equal(result.unnecessaryReview, 1);
  assert.equal(result.falseClearRate, 0.5);
  assert.equal(result.discrepancyDetectionRecall, 0.5);
  assert.equal(result.unnecessaryReviewRate, 0.5);
  assert.equal(result.meanAbsoluteCountError, 0.75);
});

test("insufficient evidence is not silently counted as a clear", () => {
  const result = evaluateShadowCases([
    { id: "missing", truth: "discrepant", disposition: "insufficient_evidence" },
  ]);

  assert.equal(result.insufficientEvidence, 1);
  assert.equal(result.falseClear, 0);
  assert.equal(result.falseClearRate, null);
  assert.equal(result.discrepancyDetectionRecall, null);
});

test("empty datasets return null rates instead of invented certainty", () => {
  const result = evaluateShadowCases([]);
  assert.equal(result.total, 0);
  assert.equal(result.falseClearRate, null);
  assert.equal(result.reviewPrecision, null);
  assert.equal(result.meanAbsoluteCountError, null);
});
