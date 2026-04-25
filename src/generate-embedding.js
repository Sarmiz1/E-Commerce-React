import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const { id, name, keywords } = await req.json();

    const input = `${name} ${(keywords || []).join(" ")}`;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
    });

    const vector = embedding.data[0].embedding;

    const { error } = await supabase
      .from("products")
      .update({ embedding: vector })
      .eq("id", id);

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