import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read env file
const envData = fs.readFileSync(".env", "utf8");
const supabaseUrlMatch = envData.match(/VITE_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envData.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.error("Missing supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrlMatch[1].trim(), supabaseKeyMatch[1].trim());

async function run() {
  // Test authentication - maybe login as a test user if needed, or just insert
  // Since we don't have user credentials, we can just test if the RPC exists and works
  
  // Let's get a random product
  const { data: products } = await supabase.from("products").select("id").limit(1);
  if (!products || !products.length) {
    console.error("No products found");
    return;
  }
  const productId = products[0].id;
  
  // Get a variant
  const { data: variants } = await supabase.from("product_variants").select("id").eq("product_id", productId).limit(1);
  const variantId = variants?.[0]?.id;
  
  console.log("Product:", productId, "Variant:", variantId);
  
  // Create a cart for testing? We can't easily do it without a user unless RLS allows it.
  const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: null, status: "active" }) // Might fail RLS
        .select("id")
        .single();
        
  console.log("Cart creation result:", newCart, createError);
}

run();
