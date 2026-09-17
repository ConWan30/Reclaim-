create extension if not exists pgcrypto;

create type public.claim_state as enum ('scanned','identified','pending','manifested','submitted','verified','rewarded','rejected','expired','cancelled','review_required');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  gtin text not null unique,
  brand text,
  name text not null,
  material text not null check (material in ('glass','aluminum','pet','other')),
  volume_ml integer check (volume_ml > 0),
  created_at timestamptz not null default now()
);

create table public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  country_code text not null default 'US'
);

create table public.incentive_programs (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references public.jurisdictions(id),
  name text not null,
  kind text not null check (kind in ('statutory_deposit','sponsor','municipal','recycler')),
  amount_cents integer not null check (amount_cents >= 0),
  material text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  active boolean not null default false,
  check (ends_at is null or ends_at > starts_at)
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jurisdiction_id uuid references public.jurisdictions(id),
  active boolean not null default false
);

create table public.container_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid references public.products(id),
  scanned_gtin text not null,
  state public.claim_state not null default 'scanned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_manifests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'open' check (status in ('open','submitted','verified','rejected','cancelled')),
  created_at timestamptz not null default now()
);

create table public.manifest_items (
  manifest_id uuid not null references public.collection_manifests(id),
  claim_id uuid not null unique references public.container_claims(id),
  primary key (manifest_id, claim_id)
);

create table public.recovery_events (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null unique references public.collection_manifests(id),
  facility_id uuid not null references public.facilities(id),
  verified_by uuid not null references auth.users(id),
  verification_method text not null,
  accepted_count integer not null check (accepted_count >= 0),
  accepted_weight_grams integer check (accepted_weight_grams >= 0),
  idempotency_key text not null unique,
  verified_at timestamptz not null default now()
);

create table public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  recovery_event_id uuid not null references public.recovery_events(id),
  incentive_program_id uuid not null references public.incentive_programs(id),
  amount_cents integer not null check (amount_cents >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  unique (recovery_event_id, incentive_program_id)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.container_claims enable row level security;
alter table public.collection_manifests enable row level security;
alter table public.manifest_items enable row level security;
alter table public.recovery_events enable row level security;
alter table public.reward_ledger enable row level security;
alter table public.audit_events enable row level security;

create policy "users read own claims" on public.container_claims for select using (auth.uid() = user_id);
create policy "users create own scans" on public.container_claims for insert with check (auth.uid() = user_id and state = 'scanned');
create policy "users read own manifests" on public.collection_manifests for select using (auth.uid() = user_id);
create policy "users create own open manifests" on public.collection_manifests for insert with check (auth.uid() = user_id and status = 'open');
create policy "users read own rewards" on public.reward_ledger for select using (auth.uid() = user_id);

-- Deliberately no client UPDATE policy on claims and no client INSERT policy on
-- recovery_events/reward_ledger. Privileged server functions own verification and settlement.
