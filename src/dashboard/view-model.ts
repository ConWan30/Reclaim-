import type { ClaimState } from '../domain/claim-state';
import type { RecoveryEvidence } from '../domain/evidence';
import {
  projectClaimStatus,
  renderMetricCard,
  type Metric,
  type MetricCardView,
  type DashboardStatusProjection,
} from './contract';

export interface DashboardClaimInput {
  claimId: string;
  state: ClaimState;
  evidence?: readonly RecoveryEvidence[];
}

export interface DashboardClaimRow {
  claimId: string;
  status: DashboardStatusProjection;
}

export interface DashboardMetricInput {
  title: string;
  metric: Metric<number>;
  suffix?: string;
  provenanceLabel: string;
}

export interface DashboardMetricCard extends MetricCardView {
  title: string;
  provenanceLabel: string;
}

export interface DashboardViewModel {
  claims: DashboardClaimRow[];
  metrics: DashboardMetricCard[];
  notices: readonly string[];
}

const SAFETY_NOTICES = [
  'A scan identifies an item; it does not prove physical recovery.',
  'AI and other observations are evidence only and cannot establish verified recovery.',
  'Rewards are shown as verified only when backed by authoritative physical recovery evidence.',
] as const;

export function buildDashboardViewModel(
  claims: readonly DashboardClaimInput[],
  metrics: readonly DashboardMetricInput[],
): DashboardViewModel {
  return {
    claims: claims.map((claim) => ({
      claimId: claim.claimId,
      status: projectClaimStatus(claim.state, claim.evidence ?? []),
    })),
    metrics: metrics.map(({ title, metric, suffix, provenanceLabel }) => ({
      title,
      provenanceLabel,
      ...renderMetricCard(title, metric, suffix),
    })),
    notices: SAFETY_NOTICES,
  };
}
