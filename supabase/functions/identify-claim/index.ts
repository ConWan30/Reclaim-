import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !publishable) return json({ error: "server_configuration_error" }, 500);

  const supabase = createClient(url, publishable, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json({ error: "unauthorized" }, 401);

  const body = await req.json().catch(() => null) as { claim_id?: string; product_id?: string; jurisdiction_id?: string } | null;
  if (!body?.claim_id || !body.product_id || !body.jurisdiction_id) return json({ error: "invalid_request" }, 400);

  const { data: claim } = await supabase.from("container_claims").select("id,user_id,state").eq("id", body.claim_id).maybeSingle();
  if (!claim || claim.user_id !== user.id || claim.state !== "scanned") return json({ error: "claim_not_scanned_or_not_owned" }, 409);

  const { data: product } = await supabase.from("products").select("id,material").eq("id", body.product_id).maybeSingle();
  const { data: jurisdiction } = await supabase.from("jurisdictions").select("id,code").eq("id", body.jurisdiction_id).maybeSingle();
  if (!product || !jurisdiction) return json({ error: "unknown_product_or_jurisdiction" }, 422);

  // No client UPDATE privilege exists. This endpoint intentionally stops before mutation
  // until a dedicated trusted transition role is connected to the Edge runtime.
  return json({ error: "transition_not_enabled", claim_id: claim.id, jurisdiction_code: jurisdiction.code, material: product.material }, 503);
});