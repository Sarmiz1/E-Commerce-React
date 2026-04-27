import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSellerProfileSchema() {
  console.log("🧐 Inspecting seller_profiles schema and data...");

  // Get a sample row to see what data is actually there
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Error fetching sample:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️ No data in seller_profiles table yet.");
    return;
  }

  const sample = data[0];
  console.log("\n📋 Available Columns in seller_profiles:");
  Object.keys(sample).forEach(key => {
    console.log(`- ${key}: ${typeof sample[key]} (Sample: ${sample[key]})`);
  });

  // Check profiles too since it's the base
  const { data: pData } = await supabase.from('profiles').select('*').limit(1);
  if (pData?.[0]) {
    console.log("\n👤 Available Columns in profiles:");
    Object.keys(pData[0]).forEach(key => {
      console.log(`- ${key}: ${typeof pData[0][key]} (Sample: ${pData[0][key]})`);
    });
  }
}

checkSellerProfileSchema();
