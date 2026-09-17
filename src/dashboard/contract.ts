import type { ClaimState } from '../domain/claim-state';
import type { RecoveryEvidence } from '../domain/evidence';

export type MetricUnavailableReason =
  | 'source_unavailable'
  | 'integrity_unresolved'
  | 'insufficient_provenance'
  | 'empty_denominator'
  | 'methodology_missing';

export type Metric<T> =
  | { availability: 'available'; value: T }
  | { availability: 'unavailable'; reason: MetricUnavailableReason };

export type DashboardStatus =
  | 'scan_captured'
  | 'identified'
  | 'evidence_available'
  | 'awaiting_verification'
  | 'needs_review'
  | 'verified_recovery'
  | 'rewarded'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type DashboardAuthority =
  | 'observation'
  | 'workflow'
  | 'physical_verification'
  | 'settlement';

export interface DashboardStatusProjection {
  status: DashboardStatus;
  label: string;
  authority: DashboardAuthority;
  countsAsRecovery: boolean;
  countsAsVerifiedImpact: boolean;
}

const NON_RECOVERY: Pick<DashboardStatusProjection, 'countsAsRecovery' | 'countsAsVerifiedImpact'> = {
  countsAsRecovery: false,
  countsAsVerifiedImpact: false,
};

export function projectClaimStatus(state: ClaimState, evidence: readonly RecoveryEvidence[] = []): DashboardStatusProjection {
  const authoritative = evidence.some((item) => item.authority === 'authoritative');

  switch (state) {
    case 'scanned': return { status: 'scan_captured', label: 'Scan Captured', authority: 'observation', ...NON_RECOVERY };
    case 'identified': return { status: 'identified', label: 'Item Identified', authority: 'observation', ...NON_RECOVERY };
    case 'pending':
    case 'manifested':
    case 'submitted': return { status: evidence.length ? 'evidence_available' : 'awaiting_verification', label: evidence.length ? 'Evidence Available' : 'Awaiting Verification', authority: 'workflow', ...NON_RECOVERY };
    case 'review_required': return { status: 'needs_review', label: 'Needs Review', authority: 'workflow', ...NON_RECOVERY };
    case 'rejected': return { status: 'rejected', label: 'Not Verified', authority: 'workflow', ...NON_RECOVERY };
    case 'expired': return { status: 'expired', label: 'Expired', authority: 'workflow', ...NON_RECOVERY };
    case 'cancelled': return { status: 'cancelled', label: 'Cancelled', authority: 'workflow', ...NON_RECOVERY };
    case 'verified':
      return authoritative
        ? { status: 'verified_recovery', label: 'Verified Recovery', authority: 'physical_verification', countsAsRecovery: true, countsAsVerifiedImpact: true }
        : { status: 'needs_review', label: 'Verification Unavailable', authority: 'workflow', ...NON_RECOVERY };
    case 'rewarded':
      return authoritative
        ? { status: 'rewarded', label: 'Rewarded', authority: 'settlement', countsAsRecovery: true, countsAsVerifiedImpact: true }
        : { status: 'needs_review', label: 'Verification Unavailable', authority: 'workflow', ...NON_RECOVERY };
  }
}

export interface VerifiedRecoveryProjection {
  recoveryEventId: string;
  claimId: string;
  participantId: string;
  verifiedAt: string;
  facilityId: string;
  measuredMassKg?: number;
}

export interface CaptureCohort {
  claimIds: ReadonlySet<string>;
}

export function reachedVerification(cohort: CaptureCohort, recoveries: readonly VerifiedRecoveryProjection[]): Metric<number> {
  if (cohort.claimIds.size === 0) return { availability: 'unavailable', reason: 'empty_denominator' };
  const verified = new Set(recoveries.filter((r) => cohort.claimIds.has(r.claimId)).map((r) => r.claimId));
  return { availability: 'available', value: (verified.size / cohort.claimIds.size) * 100 };
}

export function verifiedParticipants(recoveries: readonly VerifiedRecoveryProjection[]): Metric<number> {
  return { availability: 'available', value: new Set(recoveries.map((r) => r.participantId)).size };
}

export function metricFromAuthoritativeCount(count: number | null, sourceAvailable: boolean): Metric<number> {
  if (!sourceAvailable || count === null) return { availability: 'unavailable', reason: 'source_unavailable' };
  return { availability: 'available', value: count };
}

export interface MetricCardView {
  display: string;
  accessibleLabel: string;
  unavailable: boolean;
}

export function renderMetricCard(title: string, metric: Metric<number>, suffix = ''): MetricCardView {
  if (metric.availability === 'unavailable') {
    return { display: 'Unavailable', accessibleLabel: `${title}: unavailable`, unavailable: true };
  }
  const display = `${metric.value}${suffix}`;
  return { display, accessibleLabel: `${title}: ${display}`, unavailable: false };
}
