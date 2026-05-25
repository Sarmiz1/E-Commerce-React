import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error("❌ Missing required Supabase environment variables in .env");
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, anonKey);
const serviceClient = createClient(supabaseUrl, serviceKey);

async function runTests() {
  console.log("🔒 Starting RLS Verification Tests...\n");

  const results = [];

  // Test 1: Public Read of Products (Should succeed)
  try {
    const { data, error } = await anonClient.from('products').select('id, name').limit(1);
    results.push({
      test: "Public Read Products (respecting RLS)",
      expected: "Success",
      actual: error ? `Failed: ${error.message}` : "Success (Item read: " + (data?.[0]?.name || "None") + ")",
      status: error ? "❌" : "✅"
    });
  } catch (e) {
    results.push({ test: "Public Read Products", expected: "Success", actual: e.message, status: "❌" });
  }

  // Test 2: Anonymous insert into products (Should fail)
  try {
    const { error } = await anonClient.from('products').insert({
      name: "Malicious product",
      slug: "malicious-product",
      price_cents: 9999,
      image: "malicious.jpg"
    });
    results.push({
      test: "Unauthorized insert into products",
      expected: "Block (Error)",
      actual: error ? `Blocked correctly: ${error.message}` : "Allowed (VULNERABILITY!)",
      status: error ? "✅" : "❌"
    });
  } catch (e) {
    results.push({ test: "Unauthorized insert into products", expected: "Block", actual: e.message, status: "✅" });
  }

  // Test 3: Anonymous read of carts (Should be blocked/empty unless logged in)
  try {
    const { data, error } = await anonClient.from('carts').select('*');
    results.push({
      test: "Anonymous read of carts",
      expected: "Empty/Blocked",
      actual: error ? `Blocked correctly: ${error.message}` : `Succeeded (read ${data?.length || 0} rows - potential leak if not empty)`,
      status: (error || !data || data.length === 0) ? "✅" : "❌"
    });
  } catch (e) {
    results.push({ test: "Anonymous read of carts", expected: "Empty/Blocked", actual: e.message, status: "✅" });
  }

  // Test 4: Service Role access (Should always bypass RLS and succeed)
  try {
    const { data, error } = await serviceClient.from('products').select('id, name').limit(1);
    results.push({
      test: "Service Role Read (Bypassing RLS)",
      expected: "Success",
      actual: error ? `Failed: ${error.message}` : "Success",
      status: error ? "❌" : "✅"
    });
  } catch (e) {
    results.push({ test: "Service Role Read", expected: "Success", actual: e.message, status: "❌" });
  }

  console.table(results);
}

runTests();
