import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

Deno.serve(async (req) => {
  try {
    const {
      event_type,
      product_id,
      variant_id,
      quantity,
      user_id,
      session_id,
      metadata = {},
    } = await req.json();

    if (!event_type || !product_id) {
      return new Response(
        JSON.stringify({ error: "event_type and product_id are required" }),
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc("track__event", {
      p_event_type: event_type,
      p_product_id: product_id,
      p_variant_id: variant_id ?? null,
      p_quantity: quantity ?? null,
      p_user_id: user_id ?? null,
      p_session_id: session_id ?? null,
      p_metadata: metadata,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});