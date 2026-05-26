import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: prods, error: err2 } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Latest products:', prods.map(p => ({id: p.id, name: p.name, seller: p.seller_id, created_at: p.created_at})));
}

check();
