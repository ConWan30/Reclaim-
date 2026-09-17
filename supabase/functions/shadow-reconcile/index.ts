import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return Response.json({ error: "unauthorized" }, { status: 401 });

  const url = Deno.env.get("SUPABASE_URL")!;
  const publishable = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(url, publishable, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { manifest_id, claimed_count, observed_count, expected_material, observed_material, measured_weight_grams, expected_weight_min_grams, expected_weight_max_grams } = body;
  if (!manifest_id || !Number.isFinite(claimed_count) || !expected_material) return Response.json({ error: "invalid_input" }, { status: 400 });

  // Authorization is established with the caller-scoped RLS client before any
  // privileged client is created or used.
  const { data: manifest } = await userClient.from("collection_manifests").select("id,user_id").eq("id", manifest_id).eq("user_id", user.id).maybeSingle();
  if (!manifest) return Response.json({ error: "not_found" }, { status: 404 });

  const reasons: string[] = [];
  const hasCount = Number.isFinite(observed_count);
  const hasMaterial = typeof observed_material === "string" && observed_material.length > 0;
  if (!hasCount) reasons.push("MISSING_OBSERVED_COUNT");
  if (!hasMaterial) reasons.push("MISSING_MATERIAL_OBSERVATION");
  if (hasMaterial && observed_material !== expected_material) reasons.push("MATERIAL_MISMATCH");
  if (hasCount && observed_count !== claimed_count) reasons.push("COUNT_MISMATCH");
  if (Number.isFinite(measured_weight_grams) && Number.isFinite(expected_weight_min_grams) && Number.isFinite(expected_weight_max_grams) && (measured_weight_grams < expected_weight_min_grams || measured_weight_grams > expected_weight_max_grams)) reasons.push("WEIGHT_OUTSIDE_EXPECTED_RANGE");
  const complete = hasCount && hasMaterial;
  const mismatch = reasons.some((r) => r.endsWith("MISMATCH") || r === "WEIGHT_OUTSIDE_EXPECTED_RANGE");
  const disposition = !complete ? "insufficient_evidence" : mismatch ? "review" : "consistent";
  const reasonCodes = reasons.length ? reasons : ["CONSISTENT"];

  // SUPABASE_SERVICE_ROLE_KEY is a built-in Edge Function secret. It is never
  // accepted from the request. Its only use here is calling the server-only RPC,
  // which itself hardcodes authority='observation'.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return Response.json({ error: "observation_writer_unavailable" }, { status: 503 });
  const serverClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: evidenceId, error: persistError } = await serverClient.schema("private").rpc("append_evidence_observation", {
    p_claim_id: null,
    p_manifest_id: manifest_id,
    p_source: "system",
    p_observation_type: "reconciliation",
    p_observed_at: new Date().toISOString(),
    p_input_refs: [],
    p_model_provider: "reclaim",
    p_model_id: "shadow-reconciler",
    p_model_version: "1",
    p_confidence: null,
    p_reason_codes: reasonCodes,
    p_payload: { claimed_count, observed_count: hasCount ? observed_count : null, expected_material, observed_material: hasMaterial ? observed_material : null, measured_weight_grams: Number.isFinite(measured_weight_grams) ? measured_weight_grams : null, disposition },
  });
  if (persistError) return Response.json({ error: "observation_persist_failed" }, { status: 500 });

  return Response.json({ mode: "shadow", authoritative: false, disposition, reason_codes: reasonCodes, persisted: true, evidence_id: evidenceId });
});
