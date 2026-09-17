import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluationDataset, validateEvaluationDataset } from "../src/ai/evaluation-dataset.js";

const dataset = {
  schema: "reclaim.shadow-evaluation-dataset.v1" as const,
  datasetId: "morehouse-glass-shadow",
  datasetVersion: "2026-09-17.1",
  reconcilerVersion: "1",
  labelSource: "controlled_dataset" as const,
  cases: [
    { id: "case-1", truth: "consistent" as const, disposition: "consistent" as const, claimedCount: 12, observedCount: 12, conditions: { lighting: "daylight", device: "test-camera" } },
    { id: "case-2", truth: "discrepant" as const, disposition: "review" as const, claimedCount: 12, observedCount: 10, conditions: { lighting: "low", containerCondition: "mixed" } },
  ],
};

test("runs a versioned dataset and preserves provenance", () => {
  const result = runEvaluationDataset(dataset);
  assert.equal(result.datasetId, "morehouse-glass-shadow");
  assert.equal(result.datasetVersion, "2026-09-17.1");
  assert.equal(result.reconcilerVersion, "1");
  assert.equal(result.metrics.falseClear, 0);
  assert.equal(result.metrics.discrepancyDetectionRecall, 1);
});

test("rejects unsupported schemas", () => {
  assert.throws(() => validateEvaluationDataset({ ...dataset, schema: "future" }), /unsupported dataset schema/);
});

test("rejects duplicate case ids", () => {
  assert.throws(() => validateEvaluationDataset({ ...dataset, cases: [dataset.cases[0], dataset.cases[0]] }), /unique/);
});

test("requires an independent label source", () => {
  assert.throws(() => validateEvaluationDataset({ ...dataset, labelSource: "ai" }), /independent label source/);
});
