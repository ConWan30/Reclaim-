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

  // Shadow mode: no state transition and no privileged write. A dedicated server-only
  // observation writer will persist this assessment in the next layer.
  return Response.json({ mode: "shadow", authoritative: false, disposition, reason_codes: reasons.length ? reasons : ["CONSISTENT"], persisted: false });
});
