import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSellerInsert() {
  console.log("🧪 Testing a single seller profile insert...");
  
  const { data: profile } = await supabase.from('profiles').select('id').eq('role', 'seller').limit(1).single();
  
  if (!profile) {
    console.error("❌ No seller profile found to test with.");
    return;
  }

  const testData = {
    user_id: profile.id,
    store_name: "Test Store",
    store_slug: "test-store-" + Math.random().toString(36).substring(7)
  };

  const { error } = await supabase.from('seller_profiles').upsert(testData);
  
  if (error) {
    console.error("❌ Insert Failed:", error.message);
  } else {
    console.log("✅ Insert Success!");
  }
}

testSellerInsert();
