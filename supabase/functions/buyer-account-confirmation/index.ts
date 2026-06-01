import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const ACTION_LABELS: Record<string, string> = {
  "phone:set_default": "set your default phone number",
  "address:add": "add a delivery address",
  "address:update": "update a delivery address",
  "address:delete": "delete a delivery address",
  "address:set_default": "set your default delivery address",
  "payment:add": "add a saved payment method",
  "payment:delete": "delete a saved payment method",
  "payment:set_default": "set your default payment method",
  "account:update_email": "change your WooSho account email address",
  "account:delete": "delete your WooSho account",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "your account email";
  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    if (
      !supabaseUrl
      || !anonKey
      || !serviceRoleKey
      || !resendApiKey
      || !resendFromEmail
    ) {
      return json({ error: "Account confirmation email is not configured" }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return json({ error: "Authentication is required" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user?.email) {
      return json({ error: "Authentication is required" }, 401);
    }

    const body = await req.json();
    const resourceType = typeof body?.resourceType === "string" ? body.resourceType : "";
    const actionType = typeof body?.actionType === "string" ? body.actionType : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const actionLabel = ACTION_LABELS[`${resourceType}:${actionType}`];

    if (!actionLabel) {
      return json({ error: "Unsupported secured account action" }, 400);
    }
    if (!password) {
      return json({ error: "Enter your account password to continue" }, 400);
    }

    const passwordClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: passwordError } = await passwordClient.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (passwordError) {
      return json({ error: "Account password is incorrect" }, 401);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: action, error: actionError } = await serviceClient.rpc(
      "begin_buyer_sensitive_action",
      {
        p_user_id: user.id,
        p_resource_type: resourceType,
        p_action_type: actionType,
        p_resource_id: body?.resourceId || null,
        p_payload: body?.payload || {},
      },
    );
    if (actionError) {
      return json({ error: actionError.message }, 400);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [user.email],
        subject: "Confirm your WooSho account change",
        text: [
          `Your WooSho confirmation code is ${action.confirmationCode}.`,
          "",
          `Use it to ${actionLabel}.`,
          "This code expires in 10 minutes.",
          "If you did not request this change, do not share the code.",
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      await serviceClient
        .from("buyer_sensitive_actions")
        .delete()
        .eq("id", action.requestId);

      return json({ error: "Unable to send the confirmation email" }, 502);
    }

    return json({
      requestId: action.requestId,
      resourceType: action.resourceType,
      actionType: action.actionType,
      expiresAt: action.expiresAt,
      emailHint: maskEmail(user.email),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Account confirmation failed" },
      500,
    );
  }
});
