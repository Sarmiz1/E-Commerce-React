import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deepDive() {
  console.log("🛠️ Deep Dive into Supabase Schema...");

  // 1. Check seller_profiles specifically
  const { data: sp, error: spError } = await supabase.from('seller_profiles').select('*').limit(1);
  if (spError) {
    console.error("❌ seller_profiles Error:", spError.message);
  } else {
    console.log("✅ seller_profiles is accessible.");
  }

  // 2. Check why order_items is empty
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: itemCount } = await supabase.from('order_items').select('*', { count: 'exact', head: true });
  console.log(`📦 Orders: ${orderCount} | Items: ${itemCount}`);

  // 3. Check for specific relationships on products
  console.log("\n🧪 Testing specific relationship hints for Join...");
  
  const hints = [
    'profiles!seller_id(full_name)',
    'profiles!products_seller_id_fkey(full_name)',
    'profiles(full_name)'
  ];

  for (const hint of hints) {
    const { error } = await supabase.from('products').select(`id, ${hint}`).limit(1);
    if (error) {
      console.log(`❌ Hint "${hint}" failed: ${error.message}`);
    } else {
      console.log(`✅ Hint "${hint}" WORKS!`);
    }
  }
}

deepDive();
