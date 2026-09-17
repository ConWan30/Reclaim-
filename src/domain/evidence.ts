export type EvidenceAuthority = "observation" | "authoritative";

export type EvidenceSource =
  | "barcode"
  | "ocr"
  | "vision"
  | "scale"
  | "operator"
  | "facility"
  | "system";

export type EvidenceObservationType =
  | "product_identity"
  | "material"
  | "container_count"
  | "deposit_marking"
  | "weight"
  | "reconciliation"
  | "anomaly";

export interface EvidenceInputRef {
  kind: string;
  sha256: string;
}

export interface ModelProvenance {
  provider: string;
  model: string;
  version: string;
  confidence?: number;
}

export interface ObservationEvidence {
  authority: "observation";
  source: EvidenceSource;
  observationType: EvidenceObservationType;
  observedAt: string;
  inputs: EvidenceInputRef[];
  model?: ModelProvenance;
  reasonCodes: string[];
  payload: Record<string, unknown>;
}

export interface AuthoritativeRecoveryEvidence {
  authority: "authoritative";
  source: "operator" | "facility" | "system";
  recoveryEventId: string;
  facilityId: string;
  verificationMethod: string;
  verifiedAt: string;
  receiptId?: string;
}

export type RecoveryEvidence = ObservationEvidence | AuthoritativeRecoveryEvidence;

export function canEstablishPhysicalRecovery(evidence: RecoveryEvidence): boolean {
  return evidence.authority === "authoritative";
}

export function assertObservationCannotVerify(evidence: RecoveryEvidence): void {
  if (evidence.authority === "observation" && canEstablishPhysicalRecovery(evidence)) {
    throw new Error("observation evidence cannot establish physical recovery");
  }
}
