import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: cats, error: err1 } = await supabase.from('categories').select('*');
  console.log('Categories count:', cats?.length);
  if (err1) console.error('Cats Error:', err1);

  const { data: prods, error: err2 } = await supabase.from('products').select('*');
  console.log('Products count:', prods?.length);
  if (err2) console.error('Prods Error:', err2);
  
  if (prods?.length > 0) {
    console.log('First product:', prods[0]);
  }
}

check();
