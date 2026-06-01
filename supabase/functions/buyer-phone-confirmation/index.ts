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
  add: "add a phone number",
  update: "update a phone number",
  delete: "delete a phone number",
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
      return json({ error: "Phone confirmation email is not configured" }, 500);
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
    const actionType = typeof body?.actionType === "string" ? body.actionType : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!ACTION_LABELS[actionType]) {
      return json({ error: "Unsupported phone-number action" }, 400);
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
      "begin_buyer_phone_number_action",
      {
        p_user_id: user.id,
        p_action_type: actionType,
        p_phone_id: body?.phoneId || null,
        p_country_code: body?.countryCode || null,
        p_phone_number: body?.phoneNumber || null,
        p_make_default: Boolean(body?.isDefault),
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
        subject: "Confirm your WooSho phone-number change",
        text: [
          `Your WooSho confirmation code is ${action.confirmationCode}.`,
          "",
          `Use it to ${ACTION_LABELS[actionType]}.`,
          "This code expires in 10 minutes.",
          "If you did not request this change, do not share the code.",
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      await serviceClient
        .from("buyer_phone_number_actions")
        .delete()
        .eq("id", action.requestId);

      return json({ error: "Unable to send the confirmation email" }, 502);
    }

    return json({
      requestId: action.requestId,
      actionType: action.actionType,
      expiresAt: action.expiresAt,
      emailHint: maskEmail(user.email),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Phone confirmation failed" },
      500,
    );
  }
});
