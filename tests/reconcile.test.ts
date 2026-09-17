import test from "node:test";
import assert from "node:assert/strict";
import { reconcileShadowEvidence } from "../src/ai/reconcile.js";

test("consistent shadow evidence remains non-authoritative", () => {
  const result = reconcileShadowEvidence({ manifestId: "m1", claimedCount: 42, observedCount: 42, expectedMaterial: "glass", observedMaterial: "glass" });
  assert.equal(result.disposition, "consistent");
  assert.equal(result.authoritative, false);
  assert.deepEqual(result.reasonCodes, ["CONSISTENT"]);
});

test("material mismatch routes to review", () => {
  const result = reconcileShadowEvidence({ manifestId: "m1", claimedCount: 10, observedCount: 10, expectedMaterial: "glass", observedMaterial: "pet" });
  assert.equal(result.disposition, "review");
  assert.ok(result.reasonCodes.includes("MATERIAL_MISMATCH"));
});

test("missing observations remain missing", () => {
  const result = reconcileShadowEvidence({ manifestId: "m1", claimedCount: 10, expectedMaterial: "glass" });
  assert.equal(result.disposition, "insufficient_evidence");
  assert.equal(result.authoritative, false);
  assert.ok(result.reasonCodes.includes("MISSING_OBSERVED_COUNT"));
});
