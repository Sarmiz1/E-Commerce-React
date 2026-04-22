import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggrjmukfstjmgljvgnxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncmptdWtmc3RqbWdsanZnbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxMjU1MiwiZXhwIjoyMDkxNDg4NTUyfQ.HHJAqdzPrvrgfzxiEuy7WZE0N766mMXFmJThlfZquD8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error executing query:', error.message);
  } else {
    console.log(`Total users: ${count}`);
  }
}

run();
