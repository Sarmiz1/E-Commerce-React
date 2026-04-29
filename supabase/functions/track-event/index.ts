import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl || "", serviceRoleKey || "");

const TRACK_EVENTS_TABLE = Deno.env.get("TRACK_EVENTS_TABLE") || "events";

const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUuid(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}

function normalizeQuantity(value: unknown) {
  const next = Number(value);
  return Number.isInteger(next) && next > 0 ? next : null;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: jsonHeaders });
  }

  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        {
          error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in edge function environment",
        },
        500,
      );
    }

    const {
      event_type,
      product_id,
      variant_id,
      quantity,
      user_id,
      session_id,
      metadata = {},
    } = await req.json();

    if (!event_type) {
      return json({ error: "event_type is required" }, 400);
    }

    const droppedIds = {
      product_id: product_id && !normalizeUuid(product_id) ? product_id : null,
      variant_id: variant_id && !normalizeUuid(variant_id) ? variant_id : null,
      user_id: user_id && !normalizeUuid(user_id) ? user_id : null,
    };

    const eventRow = {
      event_type,
      product_id: normalizeUuid(product_id),
      variant_id: normalizeUuid(variant_id),
      quantity: normalizeQuantity(quantity),
      user_id: normalizeUuid(user_id),
      session_id: session_id ?? null,
      metadata: {
        ...(metadata && typeof metadata === "object" ? metadata : {}),
        dropped_ids: Object.fromEntries(
          Object.entries(droppedIds).filter(([, value]) => value),
        ),
      },
    };

    const { error } = await supabase.from(TRACK_EVENTS_TABLE).insert(eventRow);

    if (error) {
      return json(
        {
          error: `Failed to insert tracking event into ${TRACK_EVENTS_TABLE}`,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
        500,
      );
    }

    return json({ success: true, table: TRACK_EVENTS_TABLE });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Tracking failed" },
      500,
    );
  }
});
