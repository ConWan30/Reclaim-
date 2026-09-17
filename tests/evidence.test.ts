import test from "node:test";
import assert from "node:assert/strict";
import { canEstablishPhysicalRecovery, type ObservationEvidence, type AuthoritativeRecoveryEvidence } from "../src/domain/evidence.js";

test("AI observation cannot establish physical recovery", () => {
  const observation: ObservationEvidence = {
    authority: "observation",
    source: "vision",
    observationType: "reconciliation",
    observedAt: new Date(0).toISOString(),
    inputs: [{ kind: "image", sha256: "a".repeat(64) }],
    model: { provider: "test", model: "shadow", version: "0", confidence: 0.99 },
    reasonCodes: ["CONSISTENT"],
    payload: { approximateCount: 42 },
  };

  assert.equal(canEstablishPhysicalRecovery(observation), false);
});

test("authoritative recovery evidence can establish physical recovery", () => {
  const evidence: AuthoritativeRecoveryEvidence = {
    authority: "authoritative",
    source: "facility",
    recoveryEventId: "recovery-1",
    facilityId: "facility-1",
    verificationMethod: "operator_count",
    verifiedAt: new Date(0).toISOString(),
  };

  assert.equal(canEstablishPhysicalRecovery(evidence), true);
});
