import { supabase } from './src/lib/supabaseClient.js';

async function check() {
  const { data: cats, error } = await supabase.from('categories').select('*');
  console.log('Categories:', cats);
  if (error) console.error('Error:', error);
}

check();
