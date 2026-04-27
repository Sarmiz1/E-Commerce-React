import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log("📊 Checking Database Status...");

  const tables = [
    'profiles',
    'seller_profiles',
    'categories',
    'products',
    'product_variants',
    'product_images',
    'orders',
    'order_items',
    'product_reviews'
  ];

  const results = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      results[table] = `Error: ${error.message}`;
    } else {
      results[table] = count;
    }
  }

  console.log("\n📈 Table Row Counts:");
  console.table(results);

  // Check for a sample product with its seller join
  console.log("\n🔍 Testing Product-Seller Join...");
  const { data: product, error: joinError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      seller:profiles (
        id,
        full_name
      )
    `)
    .limit(1)
    .single();

  if (joinError) {
    console.error("❌ Join Error:", joinError.message);
  } else {
    console.log("✅ Join Success!");
    console.log(`Sample Product: "${product.name}" | Seller: "${product.seller?.full_name || 'N/A'}"`);
  }
}

checkDatabase();
