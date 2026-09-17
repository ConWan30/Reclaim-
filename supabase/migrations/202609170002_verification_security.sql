-- Harden the exposed public schema and add explicit facility/operator authorization.
-- Verification/settlement writes remain server-only; clients cannot promote claims.

create table public.facility_operators (
  facility_id uuid not null references public.facilities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);

alter table public.products enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.incentive_programs enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_operators enable row level security;

-- Start from least privilege. Public reference data is readable by authenticated users;
-- consumer-owned records expose only the operations the client actually needs.
revoke all on table public.products, public.jurisdictions, public.incentive_programs,
  public.facilities, public.facility_operators, public.container_claims,
  public.collection_manifests, public.manifest_items, public.recovery_events,
  public.reward_ledger, public.audit_events from anon, authenticated;

grant select on table public.products, public.jurisdictions, public.incentive_programs, public.facilities to authenticated;
grant select, insert on table public.container_claims, public.collection_manifests to authenticated;
grant select, insert, delete on table public.manifest_items to authenticated;
grant select on table public.recovery_events, public.reward_ledger to authenticated;

create policy "authenticated read products" on public.products for select to authenticated using (true);
create policy "authenticated read jurisdictions" on public.jurisdictions for select to authenticated using (true);
create policy "authenticated read active programs" on public.incentive_programs for select to authenticated using (active = true);
create policy "authenticated read active facilities" on public.facilities for select to authenticated using (active = true);

-- Replace initial policies with explicit role targeting and optimized auth lookup.
drop policy if exists "users read own claims" on public.container_claims;
drop policy if exists "users create own scans" on public.container_claims;
drop policy if exists "users read own manifests" on public.collection_manifests;
drop policy if exists "users create own open manifests" on public.collection_manifests;
drop policy if exists "users read own rewards" on public.reward_ledger;

create policy "users read own claims" on public.container_claims for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users create own scans" on public.container_claims for insert to authenticated
  with check ((select auth.uid()) = user_id and state = 'scanned');
create policy "users read own manifests" on public.collection_manifests for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users create own open manifests" on public.collection_manifests for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'open');
create policy "users read own rewards" on public.reward_ledger for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users read own manifest items" on public.manifest_items for select to authenticated
  using (exists (select 1 from public.collection_manifests m where m.id = manifest_id and m.user_id = (select auth.uid())));
create policy "users add own pending claims to own manifest" on public.manifest_items for insert to authenticated
  with check (
    exists (select 1 from public.collection_manifests m where m.id = manifest_id and m.user_id = (select auth.uid()) and m.status = 'open')
    and exists (select 1 from public.container_claims c where c.id = claim_id and c.user_id = (select auth.uid()) and c.state = 'pending')
  );
create policy "users remove own open manifest items" on public.manifest_items for delete to authenticated
  using (exists (select 1 from public.collection_manifests m where m.id = manifest_id and m.user_id = (select auth.uid()) and m.status = 'open'));

create policy "users read recovery for own manifests" on public.recovery_events for select to authenticated
  using (exists (select 1 from public.collection_manifests m where m.id = manifest_id and m.user_id = (select auth.uid())));

-- Operators are deliberately not authorized through editable user metadata.
-- Server-side verification must check this table before creating a recovery event.
create index facility_operators_user_idx on public.facility_operators(user_id) where active;
create index container_claims_user_idx on public.container_claims(user_id);
create index collection_manifests_user_idx on public.collection_manifests(user_id);
create index reward_ledger_user_idx on public.reward_ledger(user_id);

-- No authenticated INSERT/UPDATE grants exist for recovery_events or reward_ledger.
-- A trusted server using a secret/service credential performs those writes only after
-- checking facility_operators and reconciling physical material.
