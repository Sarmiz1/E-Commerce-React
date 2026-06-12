import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requiredEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const signPaystackBody = async (body: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecret = requiredEnv("PAYSTACK_SECRET_KEY");
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "";
    const authHeader = req.headers.get("Authorization") || "";
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const paystackSignature = req.headers.get("x-paystack-signature");
    if (paystackSignature) {
      const expectedSignature = await signPaystackBody(rawBody, paystackSecret);
      if (expectedSignature !== paystackSignature) {
        return json({ error: "Invalid Paystack signature" }, 401);
      }

      if (body.event === "charge.success" && body.data?.reference) {
        const { data, error } = await adminClient.rpc("confirm_paystack_payment", {
          p_reference: body.data.reference,
          p_provider_payload: body.data || {},
        });

        if (error) throw error;
        return json({ received: true, ...data });
      }

      return json({ received: true });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) return json({ error: "Authentication required" }, 401);

    if (body.action === "verify") {
      const reference = String(body.reference || "").trim();
      if (!reference) return json({ error: "Payment reference is required" }, 400);

      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${paystackSecret}` } },
      );
      const verifyPayload = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyPayload?.status) {
        return json({ error: verifyPayload?.message || "Unable to verify payment" }, 400);
      }

      if (verifyPayload.data?.status !== "success") {
        return json({ error: "Payment was not successful", data: verifyPayload.data }, 402);
      }

      const { data, error } = await adminClient.rpc("confirm_paystack_payment", {
        p_reference: reference,
        p_provider_payload: verifyPayload.data || {},
      });

      if (error) throw error;
      return json({ ...data, reference, status: "paid" });
    }

    if (body.action !== "initialize") {
      return json({ error: "Unsupported checkout action" }, 400);
    }

    const cartId = body.cartId;
    if (!cartId) return json({ error: "Cart is required" }, 400);

    const orderArgs: Record<string, unknown> = {
      p_cart_id: cartId,
      p_shipping_tier: body.shippingTier || "standard",
    };
    if (body.couponCode) orderArgs.p_coupon_code = body.couponCode;

    const { data: orderId, error: orderError } = await userClient.rpc("checkout_cart", orderArgs);
    if (orderError) throw orderError;
    if (!orderId) {
      return json({ error: "Checkout order could not be initialized" }, 400);
    }

    const { data: order, error: fetchOrderError } = await adminClient
      .from("orders")
      .select("id, order_number, total_minor")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (fetchOrderError) throw fetchOrderError;
    if (!order?.id || !order?.total_minor) {
      return json({ error: "Checkout order could not be loaded" }, 400);
    }

    const reference = `woosho_${order.id}_${Date.now()}`;
    const callbackUrl = `${origin}/checkout?reference=${encodeURIComponent(reference)}`;
    const amountMinor = Number(order.total_minor || 0);

    const initializeResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountMinor,
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          order_id: order.id,
          user_id: user.id,
          checkout: body.checkout || {},
        },
      }),
    });
    const initializePayload = await initializeResponse.json();

    if (!initializeResponse.ok || !initializePayload?.status) {
      return json({ error: initializePayload?.message || "Unable to initialize Paystack" }, 400);
    }

    const authorizationUrl = initializePayload.data?.authorization_url;

    const { error: sessionError } = await adminClient
      .from("checkout_payment_sessions")
      .insert({
        user_id: user.id,
        order_id: order.id,
        provider_reference: reference,
        authorization_url: authorizationUrl,
        amount_minor: amountMinor,
        currency: "NGN",
        metadata: body.checkout || {},
      });

    if (sessionError) throw sessionError;

    return json({
      orderId: order.id,
      orderNumber: order.order_number,
      reference,
      authorizationUrl,
      accessCode: initializePayload.data?.access_code,
    });
  } catch (error) {
    return json({ error: error?.message || "Checkout failed" }, 500);
  }
});
