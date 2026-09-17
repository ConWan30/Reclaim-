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

  const body = await req.json().catch(() => null) as { manifest_id?: string } | null;
  if (!body?.manifest_id) return json({ error: "invalid_request" }, 400);

  const { data: manifest } = await supabase.from("collection_manifests").select("id,user_id,status").eq("id", body.manifest_id).maybeSingle();
  if (!manifest || manifest.user_id !== user.id || manifest.status !== "open") return json({ error: "manifest_not_open_or_not_owned" }, 409);

  const { data: items, error: itemsError } = await supabase.from("manifest_items").select("claim_id,container_claims!inner(id,user_id,state)").eq("manifest_id", body.manifest_id);
  if (itemsError || !items?.length) return json({ error: "manifest_empty_or_unreadable" }, 409);
  const invalid = items.some((item: any) => item.container_claims?.user_id !== user.id || item.container_claims?.state !== "pending");
  if (invalid) return json({ error: "manifest_contains_ineligible_claims" }, 409);

  // No client UPDATE privilege exists. This endpoint intentionally stops before mutation
  // until a dedicated trusted transition role is connected to the Edge runtime.
  return json({ error: "transition_not_enabled", manifest_id: manifest.id, claim_count: items.length }, 503);
});