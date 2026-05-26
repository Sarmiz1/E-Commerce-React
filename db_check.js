import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sellerId = "cdac96c0-b9a2-450a-92c8-acc81e069c55"; // Known seller_id
  const { data, error } = await supabase.rpc('get_seller_dashboard', {
    p_seller_id: sellerId
  });
  
  if (error) {
    console.error("RPC Error Details:", JSON.stringify(error, null, 2));
    return;
  }
  
  console.log("RPC Success!");
  console.log("Products Count:", data?.products?.length);
}
run();
