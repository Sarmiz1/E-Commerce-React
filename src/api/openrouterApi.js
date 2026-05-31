import { supabase } from "../lib/supabaseClient";

export async function requestOpenRouter(payload) {
  const { data, error } = await supabase.functions.invoke("openrouter-chat", {
    body: payload,
  });

  if (error) throw new Error(error.message || "AI request failed.");
  if (data?.error) throw new Error(data.error);

  return data;
}
