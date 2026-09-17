export type IncentiveProgram = {
  id: string;
  active: boolean;
  amountCents: number;
  material: string;
  startsAt: Date;
  endsAt?: Date;
};

export type VerifiedRecovery = {
  id: string;
  acceptedCount: number;
  material: string;
  verifiedAt: Date;
};

export function calculateReward(recovery: VerifiedRecovery, program: IncentiveProgram): number {
  if (!program.active) throw new Error('Incentive program is not active');
  if (program.amountCents < 0) throw new Error('Invalid incentive amount');
  if (recovery.acceptedCount < 0) throw new Error('Invalid recovery count');
  if (program.material !== recovery.material) throw new Error('Material is not eligible');
  if (recovery.verifiedAt < program.startsAt) throw new Error('Recovery predates program');
  if (program.endsAt && recovery.verifiedAt >= program.endsAt) throw new Error('Recovery is outside program window');
  return recovery.acceptedCount * program.amountCents;
}
