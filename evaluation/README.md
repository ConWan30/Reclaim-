# Evaluation datasets

ReClaim shadow-evaluation datasets use the schema `reclaim.shadow-evaluation-dataset.v1`.

Every dataset records a stable dataset ID, explicit dataset version, reconciler version, independent label source, and labeled cases. Optional capture conditions support later stratification by lighting, device, container condition, batch size, and material ambiguity.

Datasets must contain labels established by a facility or controlled dataset. AI-generated labels are invalid ground truth.

Do not place personal information, authentication material, private facility credentials, or unnecessary raw imagery in repository datasets. Pilot datasets should prefer de-identified structured labels and evidence references.

Evaluation is observational only. Dataset execution does not write to Supabase and cannot transition claims, verify recovery, activate incentives, or create rewards.
