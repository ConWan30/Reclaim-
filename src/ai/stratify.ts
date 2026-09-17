import { evaluateShadowCases, type ShadowEvaluation } from "./evaluate.js";
import { validateEvaluationDataset, type EvaluationDatasetCase, type EvaluationDatasetV1 } from "./evaluation-dataset.js";

export type StratumDimension = "lighting" | "device" | "containerCondition" | "batchSize" | "materialAmbiguity";

export interface StratumResult {
  dimension: StratumDimension;
  value: string;
  sampleSize: number;
  smallSample: boolean;
  metrics: ShadowEvaluation;
}

const valueFor = (item: EvaluationDatasetCase, dimension: StratumDimension): string => {
  const value = item.conditions?.[dimension];
  return value === undefined ? "unknown" : String(value);
};

export function evaluateByStratum(value: unknown, dimension: StratumDimension, minimumSampleSize = 20): StratumResult[] {
  validateEvaluationDataset(value);
  if (!Number.isInteger(minimumSampleSize) || minimumSampleSize < 1) throw new Error("minimumSampleSize must be a positive integer");
  const dataset: EvaluationDatasetV1 = value;
  const groups = new Map<string, EvaluationDatasetCase[]>();

  for (const item of dataset.cases) {
    const key = valueFor(item, dimension);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, cases]) => ({
    dimension,
    value: key,
    sampleSize: cases.length,
    smallSample: cases.length < minimumSampleSize,
    metrics: evaluateShadowCases(cases),
  }));
}

export function hasUnsafeStratum(results: readonly StratumResult[]): boolean {
  return results.some((result) => result.metrics.falseClear > 0);
}
