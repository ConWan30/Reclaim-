import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return Response.json({ error: "unauthorized" }, { status: 401 });
  const url = Deno.env.get("SUPABASE_URL")!;
  const publishable = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(url, publishable, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.manifest_id || !body?.facility_id || !body?.verification_method || !body?.idempotency_key) return Response.json({ error: "invalid_request" }, { status: 400 });
  const { data, error } = await client.rpc("verify_recovery", { p_manifest_id: body.manifest_id, p_facility_id: body.facility_id, p_verification_method: body.verification_method, p_idempotency_key: body.idempotency_key });
  if (error) return Response.json({ error: "verification_rejected" }, { status: 403 });
  return Response.json({ recovery_event_id: data });
});
