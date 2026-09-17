import { describe, expect, it } from 'vitest';
import type { RecoveryEvidence } from '../src/domain/evidence';
import {
  metricFromAuthoritativeCount,
  projectClaimStatus,
  reachedVerification,
  renderMetricCard,
  verifiedParticipants,
  type VerifiedRecoveryProjection,
} from '../src/dashboard/contract';

const observation: RecoveryEvidence = {
  authority: 'observation', source: 'barcode', observationType: 'product_identity',
  observedAt: '2026-09-17T00:00:00Z', inputs: [], reasonCodes: [], payload: {},
};
const authoritative: RecoveryEvidence = {
  authority: 'authoritative', source: 'facility', recoveryEventId: 'r1', facilityId: 'f1',
  verificationMethod: 'operator_count', verifiedAt: '2026-09-17T01:00:00Z',
};
const recovery = (claimId: string, participantId = 'p1'): VerifiedRecoveryProjection => ({
  recoveryEventId: `r-${claimId}`, claimId, participantId,
  verifiedAt: '2026-09-17T01:00:00Z', facilityId: 'f1',
});

describe('dashboard projection', () => {
  it('never presents a scan as recovery', () => {
    expect(projectClaimStatus('scanned').countsAsRecovery).toBe(false);
    expect(projectClaimStatus('scanned').label).toBe('Scan Captured');
  });

  it('does not let observation evidence establish recovery', () => {
    const projected = projectClaimStatus('verified', [observation]);
    expect(projected.countsAsRecovery).toBe(false);
    expect(projected.label).toBe('Verification Unavailable');
  });

  it('requires authoritative evidence for verified recovery', () => {
    const projected = projectClaimStatus('verified', [authoritative]);
    expect(projected.status).toBe('verified_recovery');
    expect(projected.countsAsVerifiedImpact).toBe(true);
  });

  it.each(['expired', 'cancelled'] as const)('projects %s as terminal non-recovery', (state) => {
    expect(projectClaimStatus(state).countsAsRecovery).toBe(false);
  });
});

describe('authoritative metrics', () => {
  it('distinguishes authoritative zero from unavailable', () => {
    expect(metricFromAuthoritativeCount(0, true)).toEqual({ availability: 'available', value: 0 });
    expect(metricFromAuthoritativeCount(null, false)).toEqual({ availability: 'unavailable', reason: 'source_unavailable' });
  });

  it('returns unavailable for an empty verification denominator', () => {
    expect(reachedVerification({ claimIds: new Set() }, [])).toEqual({ availability: 'unavailable', reason: 'empty_denominator' });
  });

  it('uses the capture cohort and deduplicates claim verification', () => {
    const metric = reachedVerification(
      { claimIds: new Set(['a', 'b', 'c', 'd']) },
      [recovery('a'), recovery('a'), recovery('outside')],
    );
    expect(metric).toEqual({ availability: 'available', value: 25 });
  });

  it('counts verified participants once', () => {
    expect(verifiedParticipants([recovery('a', 'p1'), recovery('b', 'p1'), recovery('c', 'p2')])).toEqual({ availability: 'available', value: 2 });
  });
});

describe('metric card rendering', () => {
  it('renders missing authority as Unavailable, never zero', () => {
    expect(renderMetricCard('Verified Recoveries', { availability: 'unavailable', reason: 'source_unavailable' }).display).toBe('Unavailable');
  });

  it('renders an authoritative zero as zero', () => {
    expect(renderMetricCard('Verified Recoveries', { availability: 'available', value: 0 }).display).toBe('0');
  });
});
