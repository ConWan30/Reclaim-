import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReward } from '../src/domain/reward.js';

const recovery = { id: 'r1', acceptedCount: 10, material: 'glass', verifiedAt: new Date('2026-10-01T12:00:00Z') };
const base = { id: 'p1', active: true, amountCents: 3, material: 'glass', startsAt: new Date('2026-09-01T00:00:00Z') };

test('verified eligible recovery calculates configured reward', () => {
  assert.equal(calculateReward(recovery, base), 30);
});

test('inactive program fails closed', () => {
  assert.throws(() => calculateReward(recovery, { ...base, active: false }));
});

test('material mismatch fails closed', () => {
  assert.throws(() => calculateReward(recovery, { ...base, material: 'aluminum' }));
});

test('expired program fails closed', () => {
  assert.throws(() => calculateReward(recovery, { ...base, endsAt: new Date('2026-10-01T12:00:00Z') }));
});
