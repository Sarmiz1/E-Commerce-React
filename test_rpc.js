import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("Calling get_seller_dashboard for cdac96c0-b9a2-450a-92c8-acc81e069c55...");
  const { data, error } = await supabase.rpc('get_seller_dashboard', {
    p_seller_id: 'cdac96c0-b9a2-450a-92c8-acc81e069c55'
  });

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('Stats:', data?.stats);
    console.log('Products length:', data?.products?.length);
    if (data?.products?.length > 0) {
      console.log('First product:', data.products[0].name);
    }
  }
}

check();
