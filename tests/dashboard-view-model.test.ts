import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RecoveryEvidence } from '../src/domain/evidence';
import { buildDashboardViewModel } from '../src/dashboard/view-model';

const observation: RecoveryEvidence = {
  authority: 'observation',
  source: 'barcode',
  observationType: 'product_identity',
  observedAt: '2026-09-17T00:00:00Z',
  inputs: [],
  reasonCodes: [],
  payload: {},
};

const authoritative: RecoveryEvidence = {
  authority: 'authoritative',
  source: 'facility',
  recoveryEventId: 'recovery-1',
  facilityId: 'facility-1',
  verificationMethod: 'operator_count',
  verifiedAt: '2026-09-17T01:00:00Z',
};

describe('dashboard view model', () => {
  it('keeps scans and observation-only claims out of verified impact', () => {
    const view = buildDashboardViewModel([
      { claimId: 'scan', state: 'scanned' },
      { claimId: 'observed', state: 'verified', evidence: [observation] },
      { claimId: 'verified', state: 'verified', evidence: [authoritative] },
    ], []);

    assert.equal(view.claims[0]?.status.countsAsVerifiedImpact, false);
    assert.equal(view.claims[1]?.status.label, 'Verification Unavailable');
    assert.equal(view.claims[1]?.status.countsAsVerifiedImpact, false);
    assert.equal(view.claims[2]?.status.label, 'Verified Recovery');
    assert.equal(view.claims[2]?.status.countsAsVerifiedImpact, true);
  });

  it('renders unavailable authority distinctly from authoritative zero', () => {
    const view = buildDashboardViewModel([], [
      {
        title: 'Verified Recoveries',
        metric: { availability: 'unavailable', reason: 'source_unavailable' },
        provenanceLabel: 'Facility recovery events',
      },
      {
        title: 'Rewards Issued',
        metric: { availability: 'available', value: 0 },
        provenanceLabel: 'Reward ledger',
      },
    ]);

    assert.equal(view.metrics[0]?.display, 'Unavailable');
    assert.equal(view.metrics[0]?.unavailable, true);
    assert.equal(view.metrics[1]?.display, '0');
    assert.equal(view.metrics[1]?.unavailable, false);
  });

  it('carries provenance and explicit safety copy into the UI boundary', () => {
    const view = buildDashboardViewModel([], [{
      title: 'Verified Recoveries',
      metric: { availability: 'available', value: 4 },
      provenanceLabel: 'Facility recovery events',
    }]);

    assert.equal(view.metrics[0]?.provenanceLabel, 'Facility recovery events');
    assert.ok(view.notices.some((notice) => notice.includes('does not prove physical recovery')));
    assert.ok(view.notices.some((notice) => notice.includes('cannot establish verified recovery')));
  });
});
