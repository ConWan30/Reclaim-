export const CLAIM_STATES = [
  'scanned', 'identified', 'pending', 'manifested', 'submitted',
  'verified', 'rewarded', 'rejected', 'expired', 'cancelled', 'review_required'
] as const;

export type ClaimState = (typeof CLAIM_STATES)[number];
export type Actor = 'consumer' | 'operator' | 'system' | 'admin';

const transitions: Record<ClaimState, readonly ClaimState[]> = {
  scanned: ['identified', 'rejected', 'review_required'],
  identified: ['pending', 'rejected', 'review_required'],
  pending: ['manifested', 'cancelled', 'expired', 'review_required'],
  manifested: ['submitted', 'cancelled', 'expired', 'review_required'],
  submitted: ['verified', 'rejected', 'review_required'],
  verified: ['rewarded', 'review_required'],
  rewarded: [], rejected: [], expired: [], cancelled: [],
  review_required: ['pending', 'rejected', 'cancelled']
};

export function canTransition(from: ClaimState, to: ClaimState, actor: Actor): boolean {
  if (!transitions[from].includes(to)) return false;
  if ((to === 'verified' || to === 'rewarded') && actor === 'consumer') return false;
  if (to === 'verified' && !['operator', 'system', 'admin'].includes(actor)) return false;
  if (to === 'rewarded' && !['system', 'admin'].includes(actor)) return false;
  return true;
}

export function transitionClaim(from: ClaimState, to: ClaimState, actor: Actor): ClaimState {
  if (!canTransition(from, to, actor)) {
    throw new Error(`Forbidden claim transition: ${from} -> ${to} by ${actor}`);
  }
  return to;
}
