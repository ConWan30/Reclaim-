import assert from 'node:assert/strict';
import test from 'node:test';
import type { RecoveryEvidence } from '../src/domain/evidence.js';
import {
  metricFromAuthoritativeCount,
  projectClaimStatus,
  reachedVerification,
  renderMetricCard,
  verifiedParticipants,
  type VerifiedRecoveryProjection,
} from '../src/dashboard/contract.js';

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

test('scan is never presented as recovery', () => {
  const projected = projectClaimStatus('scanned');
  assert.equal(projected.countsAsRecovery, false);
  assert.equal(projected.label, 'Scan Captured');
});

test('observation evidence cannot establish recovery', () => {
  const projected = projectClaimStatus('verified', [observation]);
  assert.equal(projected.countsAsRecovery, false);
  assert.equal(projected.label, 'Verification Unavailable');
});

test('authoritative evidence is required for verified recovery', () => {
  const projected = projectClaimStatus('verified', [authoritative]);
  assert.equal(projected.status, 'verified_recovery');
  assert.equal(projected.countsAsVerifiedImpact, true);
});

for (const state of ['expired', 'cancelled'] as const) {
  test(`${state} projects as terminal non-recovery`, () => {
    assert.equal(projectClaimStatus(state).countsAsRecovery, false);
  });
}

test('authoritative zero is distinct from unavailable', () => {
  assert.deepEqual(metricFromAuthoritativeCount(0, true), { availability: 'available', value: 0 });
  assert.deepEqual(metricFromAuthoritativeCount(null, false), { availability: 'unavailable', reason: 'source_unavailable' });
});

test('empty verification denominator is unavailable', () => {
  assert.deepEqual(reachedVerification({ claimIds: new Set() }, []), { availability: 'unavailable', reason: 'empty_denominator' });
});

test('verification metric uses capture cohort and deduplicates claims', () => {
  const metric = reachedVerification(
    { claimIds: new Set(['a', 'b', 'c', 'd']) },
    [recovery('a'), recovery('a'), recovery('outside')],
  );
  assert.deepEqual(metric, { availability: 'available', value: 25 });
});

test('verified participants are counted once', () => {
  assert.deepEqual(
    verifiedParticipants([recovery('a', 'p1'), recovery('b', 'p1'), recovery('c', 'p2')]),
    { availability: 'available', value: 2 },
  );
});

test('missing authority renders Unavailable, never zero', () => {
  const view = renderMetricCard('Verified Recoveries', { availability: 'unavailable', reason: 'source_unavailable' });
  assert.equal(view.display, 'Unavailable');
});

test('authoritative zero renders as zero', () => {
  const view = renderMetricCard('Verified Recoveries', { availability: 'available', value: 0 });
  assert.equal(view.display, '0');
});
