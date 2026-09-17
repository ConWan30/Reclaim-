export interface ShadowEvidenceInput {
  manifestId: string;
  claimedCount: number;
  observedCount?: number;
  observedMaterial?: string;
  expectedMaterial: string;
  measuredWeightGrams?: number;
  expectedWeightRangeGrams?: [number, number];
}

export interface ShadowAssessment {
  mode: "shadow";
  authoritative: false;
  evidenceComplete: boolean;
  disposition: "consistent" | "review" | "insufficient_evidence";
  reasonCodes: string[];
  payload: Record<string, unknown>;
}

export function reconcileShadowEvidence(input: ShadowEvidenceInput): ShadowAssessment {
  const reasons: string[] = [];
  const hasCount = Number.isFinite(input.observedCount);
  const hasMaterial = Boolean(input.observedMaterial);

  if (!hasCount) reasons.push("MISSING_OBSERVED_COUNT");
  if (!hasMaterial) reasons.push("MISSING_MATERIAL_OBSERVATION");

  if (hasMaterial && input.observedMaterial !== input.expectedMaterial) {
    reasons.push("MATERIAL_MISMATCH");
  }

  if (hasCount && input.observedCount !== input.claimedCount) {
    reasons.push("COUNT_MISMATCH");
  }

  if (input.measuredWeightGrams !== undefined && input.expectedWeightRangeGrams) {
    const [min, max] = input.expectedWeightRangeGrams;
    if (input.measuredWeightGrams < min || input.measuredWeightGrams > max) {
      reasons.push("WEIGHT_OUTSIDE_EXPECTED_RANGE");
    }
  }

  const evidenceComplete = hasCount && hasMaterial;
  const mismatch = reasons.some((code) => code.endsWith("MISMATCH") || code === "WEIGHT_OUTSIDE_EXPECTED_RANGE");
  const disposition = !evidenceComplete ? "insufficient_evidence" : mismatch ? "review" : "consistent";

  return {
    mode: "shadow",
    authoritative: false,
    evidenceComplete,
    disposition,
    reasonCodes: reasons.length ? reasons : ["CONSISTENT"],
    payload: {
      manifestId: input.manifestId,
      claimedCount: input.claimedCount,
      observedCount: input.observedCount ?? null,
      expectedMaterial: input.expectedMaterial,
      observedMaterial: input.observedMaterial ?? null,
      measuredWeightGrams: input.measuredWeightGrams ?? null,
    },
  };
}
