import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTheTruth() {
  console.log("🕵️ Verifying exact relationship names...");

  const queries = [
    'profiles!seller_id(id)',
    'profiles!products_seller_id_fkey(id)',
    'profiles!products_seller_id_profiles_id_fk(id)'
  ];

  for (const q of queries) {
    const { error } = await supabase.from('products').select(`id, ${q}`).limit(1);
    if (error) {
      console.log(`❌ ${q} -> ${error.message}`);
    } else {
      console.log(`✅ ${q} WORKS!`);
    }
  }

  // Check the profiles -> seller_profiles join too
  const { error: spError } = await supabase.from('profiles').select('id, seller_profiles(store_name)').limit(1);
  if (spError) {
      console.log(`❌ profiles -> seller_profiles join failed: ${spError.message}`);
  } else {
      console.log(`✅ profiles -> seller_profiles join WORKS!`);
  }
}

findTheTruth();
