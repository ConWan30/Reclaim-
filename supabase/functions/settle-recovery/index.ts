import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return Response.json({ error: "unauthorized" }, { status: 401 });
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.recovery_event_id || !body?.incentive_program_id || !body?.idempotency_key) return Response.json({ error: "invalid_request" }, { status: 400 });
  const { data, error } = await client.rpc("settle_recovery", { p_recovery_event_id: body.recovery_event_id, p_incentive_program_id: body.incentive_program_id, p_idempotency_key: body.idempotency_key });
  if (error) return Response.json({ error: "settlement_rejected" }, { status: 403 });
  return Response.json({ reward_id: data });
});
