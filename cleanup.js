import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log("🧨 Starting deep database cleanup...");

  // Order matters for FK constraints
  const deletionMap = [
    { table: 'inventory_reservations', pk: 'id' },
    { table: 'order_tracking_events', pk: 'id' },
    { table: 'order_items', pk: 'id' },
    { table: 'shipments', pk: 'id' },
    { table: 'payments', pk: 'id' },
    { table: 'transactions', pk: 'id' },
    { table: 'orders', pk: 'id' },
    { table: 'cart_items', pk: 'id' },
    { table: 'carts', pk: 'id' },
    { table: 'product_reviews', pk: 'id' },
    { table: 'product_metrics', pk: 'product_id' },
    { table: 'product_images', pk: 'id' },
    { table: 'product_variants', pk: 'id' },
    { table: 'products', pk: 'id' },
    { table: 'categories', pk: 'id' },
    { table: 'addresses', pk: 'id' },
    { table: 'seller_profiles', pk: 'user_id' },
    { table: 'profiles', pk: 'id' }
  ];

  for (const { table, pk } of deletionMap) {
    console.log(`Clearing ${table}...`);
    // Delete all rows where PK is not null (guaranteed for all rows)
    const { error } = await supabase.from(table).delete().not(pk, 'is', null);
    
    if (error) {
      console.error(`❌ Error clearing ${table}:`, error.message);
    } else {
        console.log(`✅ ${table} cleared.`);
    }
  }

  console.log("\n✨ Database is now completely empty of seed data!");
}

cleanup();
