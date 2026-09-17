import { evaluateShadowCases, type GroundTruth, type ShadowDisposition, type ShadowEvaluation } from "./evaluate.js";

export interface CaptureConditions {
  lighting?: string;
  device?: string;
  containerCondition?: string;
  batchSize?: number;
  materialAmbiguity?: string;
}

export interface EvaluationDatasetCase {
  id: string;
  truth: GroundTruth;
  disposition: ShadowDisposition;
  claimedCount?: number;
  observedCount?: number;
  conditions?: CaptureConditions;
}

export interface EvaluationDatasetV1 {
  schema: "reclaim.shadow-evaluation-dataset.v1";
  datasetId: string;
  datasetVersion: string;
  reconcilerVersion: string;
  labelSource: "facility" | "controlled_dataset";
  cases: EvaluationDatasetCase[];
}

export interface EvaluationRun {
  datasetId: string;
  datasetVersion: string;
  reconcilerVersion: string;
  metrics: ShadowEvaluation;
}

export function validateEvaluationDataset(value: unknown): asserts value is EvaluationDatasetV1 {
  if (!value || typeof value !== "object") throw new Error("dataset must be an object");
  const dataset = value as Partial<EvaluationDatasetV1>;
  if (dataset.schema !== "reclaim.shadow-evaluation-dataset.v1") throw new Error("unsupported dataset schema");
  if (!dataset.datasetId || !dataset.datasetVersion || !dataset.reconcilerVersion) throw new Error("dataset provenance is required");
  if (dataset.labelSource !== "facility" && dataset.labelSource !== "controlled_dataset") throw new Error("independent label source is required");
  if (!Array.isArray(dataset.cases)) throw new Error("cases must be an array");

  const ids = new Set<string>();
  for (const item of dataset.cases) {
    if (!item?.id || ids.has(item.id)) throw new Error("case ids must be unique and non-empty");
    ids.add(item.id);
    if (item.truth !== "consistent" && item.truth !== "discrepant") throw new Error(`invalid truth for ${item.id}`);
    if (!(["consistent", "review", "insufficient_evidence"] as const).includes(item.disposition)) throw new Error(`invalid disposition for ${item.id}`);
  }
}

export function runEvaluationDataset(value: unknown): EvaluationRun {
  validateEvaluationDataset(value);
  return {
    datasetId: value.datasetId,
    datasetVersion: value.datasetVersion,
    reconcilerVersion: value.reconcilerVersion,
    metrics: evaluateShadowCases(value.cases),
  };
}
