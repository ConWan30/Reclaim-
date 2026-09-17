import test from "node:test";
import assert from "node:assert/strict";
import { evaluateByStratum, hasUnsafeStratum } from "../src/ai/stratify.js";

const dataset = {
  schema: "reclaim.shadow-evaluation-dataset.v1" as const,
  datasetId: "pilot",
  datasetVersion: "1",
  reconcilerVersion: "1",
  labelSource: "controlled_dataset" as const,
  cases: [
    { id: "day-ok", truth: "consistent" as const, disposition: "consistent" as const, conditions: { lighting: "daylight" } },
    { id: "low-miss", truth: "discrepant" as const, disposition: "consistent" as const, conditions: { lighting: "low" } },
    { id: "low-catch", truth: "discrepant" as const, disposition: "review" as const, conditions: { lighting: "low" } },
    { id: "unknown", truth: "consistent" as const, disposition: "consistent" as const },
  ],
};

test("surfaces false clears inside a stratum even when aggregate reporting could hide them", () => {
  const results = evaluateByStratum(dataset, "lighting", 3);
  const low = results.find((item) => item.value === "low");
  assert.equal(low?.sampleSize, 2);
  assert.equal(low?.smallSample, true);
  assert.equal(low?.metrics.falseClear, 1);
  assert.equal(hasUnsafeStratum(results), true);
});

test("preserves unknown capture conditions instead of dropping cases", () => {
  const results = evaluateByStratum(dataset, "lighting");
  assert.equal(results.find((item) => item.value === "unknown")?.sampleSize, 1);
});

test("rejects invalid minimum sample sizes", () => {
  assert.throws(() => evaluateByStratum(dataset, "lighting", 0), /positive integer/);
});
