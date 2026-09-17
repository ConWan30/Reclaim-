-- Recovery Evidence Graph: observations are non-authoritative and append-only.
-- Nothing in this schema can verify a recovery or create a reward.

create table if not exists public.evidence_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  claim_id uuid references public.container_claims(id) on delete restrict,
  manifest_id uuid references public.collection_manifests(id) on delete restrict,
  recovery_event_id uuid references public.recovery_events(id) on delete restrict,
  source text not null check (source in ('barcode','ocr','vision','scale','operator','facility','system')),
  observation_type text not null check (observation_type in ('product_identity','material','container_count','deposit_marking','weight','reconciliation','anomaly')),
  model_provider text,
  model_id text,
  model_version text,
  confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  input_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(input_refs) = 'array'),
  reason_codes jsonb not null default '[]'::jsonb check (jsonb_typeof(reason_codes) = 'array'),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  supersedes_observation_id uuid references public.evidence_observations(id) on delete restrict,
  check (claim_id is not null or manifest_id is not null or recovery_event_id is not null),
  check ((model_provider is null and model_id is null and model_version is null) or (model_provider is not null and model_id is not null and model_version is not null))
);

create index if not exists evidence_observations_claim_idx on public.evidence_observations(claim_id, observed_at desc) where claim_id is not null;
create index if not exists evidence_observations_manifest_idx on public.evidence_observations(manifest_id, observed_at desc) where manifest_id is not null;
create index if not exists evidence_observations_recovery_idx on public.evidence_observations(recovery_event_id, observed_at desc) where recovery_event_id is not null;

alter table public.evidence_observations enable row level security;

-- No client INSERT/UPDATE/DELETE grant. Trusted server/Edge infrastructure writes observations.
revoke all on public.evidence_observations from anon, authenticated;
grant select on public.evidence_observations to authenticated;

create policy evidence_observations_read_own
on public.evidence_observations
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.container_claims c
      where c.id = evidence_observations.claim_id
        and c.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.collection_manifests m
      where m.id = evidence_observations.manifest_id
        and m.user_id = (select auth.uid())
    )
  )
);

-- Defense in depth: observations are append-only. The existing private.reject_mutation
-- trigger function is deliberately reused; it is not executable by client roles.
create trigger evidence_observations_reject_update
before update on public.evidence_observations
for each row execute function private.reject_mutation();

create trigger evidence_observations_reject_delete
before delete on public.evidence_observations
for each row execute function private.reject_mutation();

comment on table public.evidence_observations is
'Append-only Recovery Evidence Graph observations. AI/model output is non-authoritative and cannot establish physical recovery, eligibility, or reward entitlement.';
