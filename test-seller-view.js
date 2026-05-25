import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function runTests() {
  console.log("Testing Products with seller view JOIN...");
  
  const { data, error } = await supabase.from('products').select(`
    *,
    seller:seller_public!seller_id(id)
  `).eq('is_active', true);

  if (error) {
    console.error("Error fetching products:", error);
  } else {
    console.log("Products fetched:", data?.length);
    if (data?.length > 0) {
      console.log("First product seller field:", data[0].seller);
    }
  }
}

runTests();
