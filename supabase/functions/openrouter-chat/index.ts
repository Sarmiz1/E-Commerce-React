import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const allowedModels = new Set([
  "google/gemini-2.5-flash",
  "openrouter/auto",
  "openrouter/free",
]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    if (!supabaseUrl || !anonKey || !openRouterKey) {
      return json({ error: "AI service is not configured" }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return json({ error: "Authentication is required" }, 401);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: "Authentication is required" }, 401);
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length || messages.length > 80) {
      return json({ error: "A valid messages array is required" }, 400);
    }

    const model = allowedModels.has(body?.model) ? body.model : "openrouter/free";
    const maxTokens = Math.min(Math.max(Number(body?.max_tokens) || 800, 1), 1500);
    const temperature = Math.min(Math.max(Number(body?.temperature) || 0.5, 0), 1);
    const openRouterBody: Record<string, unknown> = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (Array.isArray(body?.tools)) openRouterBody.tools = body.tools.slice(0, 20);
    if (typeof body?.tool_choice === "string") openRouterBody.tool_choice = body.tool_choice;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openRouterBody),
    });
    const data = await response.json();

    if (!response.ok) {
      return json({ error: "AI provider request failed" }, response.status);
    }

    return json(data);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      500,
    );
  }
});
