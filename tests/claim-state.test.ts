import assert from 'node:assert/strict';
import test from 'node:test';
import { canTransition, transitionClaim } from '../src/domain/claim-state.js';

test('consumer cannot promote a submitted claim to verified', () => {
  assert.equal(canTransition('submitted', 'verified', 'consumer'), false);
  assert.throws(() => transitionClaim('submitted', 'verified', 'consumer'));
});

test('consumer cannot jump from scanned to rewarded', () => {
  assert.equal(canTransition('scanned', 'rewarded', 'consumer'), false);
});

test('authorized operator can verify submitted recovery', () => {
  assert.equal(transitionClaim('submitted', 'verified', 'operator'), 'verified');
});

test('operator cannot issue reward; settlement is server/admin controlled', () => {
  assert.equal(canTransition('verified', 'rewarded', 'operator'), false);
  assert.equal(canTransition('verified', 'rewarded', 'system'), true);
});

test('rewarded claims are terminal', () => {
  assert.equal(canTransition('rewarded', 'pending', 'admin'), false);
});
