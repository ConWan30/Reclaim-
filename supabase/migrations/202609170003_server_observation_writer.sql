-- Server-only append path for non-authoritative Recovery Evidence Graph observations.
-- This function cannot create authoritative recovery evidence and is not executable
-- by anon or authenticated clients.

create or replace function private.append_evidence_observation(
  p_claim_id uuid,
  p_manifest_id uuid,
  p_source text,
  p_observation_type text,
  p_observed_at timestamptz,
  p_input_refs jsonb,
  p_model_provider text,
  p_model_id text,
  p_model_version text,
  p_confidence numeric,
  p_reason_codes text[],
  p_payload jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if p_claim_id is null and p_manifest_id is null then
    raise exception 'evidence requires claim or manifest';
  end if;

  if p_source not in ('barcode','ocr','vision','scale','system') then
    raise exception 'invalid observation source';
  end if;

  if p_observation_type not in ('product_identity','material','container_count','deposit_marking','weight','reconciliation','anomaly') then
    raise exception 'invalid observation type';
  end if;

  if p_confidence is not null and (p_confidence < 0 or p_confidence > 1) then
    raise exception 'confidence out of range';
  end if;

  insert into public.evidence_observations(
    claim_id, manifest_id, authority, source, observation_type, observed_at,
    input_refs, model_provider, model_id, model_version, confidence, reason_codes, payload
  ) values (
    p_claim_id, p_manifest_id, 'observation', p_source, p_observation_type,
    coalesce(p_observed_at, now()), coalesce(p_input_refs, '[]'::jsonb),
    p_model_provider, p_model_id, p_model_version, p_confidence,
    coalesce(p_reason_codes, array[]::text[]), coalesce(p_payload, '{}'::jsonb)
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function private.append_evidence_observation(uuid,uuid,text,text,timestamptz,jsonb,text,text,text,numeric,text[],jsonb) from public, anon, authenticated;
grant execute on function private.append_evidence_observation(uuid,uuid,text,text,timestamptz,jsonb,text,text,text,numeric,text[],jsonb) to service_role;

comment on function private.append_evidence_observation(uuid,uuid,text,text,timestamptz,jsonb,text,text,text,numeric,text[],jsonb)
is 'Server-only append path for non-authoritative Recovery Evidence Graph observations. Cannot create authoritative recovery evidence.';
