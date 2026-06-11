import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  try {
    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const productId = payload.product_id ?? payload.productId ?? null;
    const categorySlug = payload.category_slug ?? payload.categorySlug ?? null;
    const subcategorySlug = payload.subcategory_slug ?? payload.subcategorySlug ?? null;
    const limit = payload.limit ?? 48;
    const offset = payload.offset ?? 0;

    if (categorySlug) {
      const { data, error } = await supabase.rpc("get_category_products", {
        p_category_slug: categorySlug,
        p_subcategory_slug: subcategorySlug,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      return json({
        success: true,
        mode: "category_products",
        categorySlug,
        subcategorySlug,
        count: data?.length ?? 0,
        products: data ?? [],
      });
    }

    const { data, error } = await supabase.rpc("refresh_catalog_taxonomy", {
      p_product_id: productId,
    });

    if (error) throw error;

    return json(data ?? { success: true });
  } catch (error) {
    return json({ success: false, error: error.message || "Taxonomy refresh failed." }, 500);
  }
});
