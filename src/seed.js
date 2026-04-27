import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

if (process.env.NODE_ENV === "production") {
  throw new Error("❌ Seed blocked in production");
}

if (process.env.RUN_SEED !== "true") {
  throw new Error("❌ Run with RUN_SEED=true");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// CONFIG (BIG DATA)
// =========================
const SELLER_COUNT = 100;
const BUYER_COUNT = 200;
const PRODUCT_COUNT = 1000;
const BATCH_SIZE = 50;

const categoriesList = [
  "Fashion", "Electronics", "Home & Garden", "Beauty & Health",
  "Sports & Outdoors", "Automotive", "Books & Audible", "Gaming"
];

// =========================
// 1. USERS & PROFILES
// =========================
async function populateUsers() {
  console.log("👥 Populating Users & Profiles...");
  const sellers = [];
  const buyers = [];

  // Fetch existing users to avoid duplicates
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(authUsers?.users.map(u => [u.email, u]) || []);

  for (let i = 0; i < SELLER_COUNT + BUYER_COUNT; i++) {
    const role = i < SELLER_COUNT ? "seller" : "buyer";
    const email = `${role}${i}@market.dev`;
    
    let user;
    if (userMap.has(email)) {
      const existing = userMap.get(email);
      user = { id: existing.id, name: existing.user_metadata?.full_name || email, role };
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: "password123",
        email_confirm: true,
        user_metadata: { 
            full_name: role === 'seller' ? faker.company.name() : faker.person.fullName(), 
            role 
        }
      });

      if (error) {
        console.log(`Auth Error (${email}):`, error.message);
        continue;
      }
      user = { id: data.user.id, name: data.user.user_metadata.full_name, role };
    }

    if (role === 'seller') sellers.push(user); else buyers.push(user);
  }

  // Sync Profiles
  const allUsers = [...sellers, ...buyers];
  for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
    const chunk = allUsers.slice(i, i + BATCH_SIZE).map(u => ({
      id: u.id,
      full_name: u.name,
      role: u.role
    }));
    await supabase.from("profiles").upsert(chunk);
  }

  // Populate Seller Profiles
  console.log("🏪 Populating Seller Profiles...");
  const sProfiles = sellers.map(s => ({
    user_id: s.id,
    store_name: s.name,
    store_slug: faker.helpers.slugify(s.name).toLowerCase() + "-" + s.id.slice(0, 4),
    description: faker.company.catchPhrase(),
    store_logo: `https://picsum.photos/seed/${s.id}/200/200`,
    store_banner: `https://picsum.photos/seed/banner_${s.id}/1200/400`,
    rating: (Math.random() * 2 + 3).toFixed(1),
    is_verified_store: Math.random() < 0.2
  }));

  for (let i = 0; i < sProfiles.length; i += BATCH_SIZE) {
    await supabase.from("seller_profiles").upsert(sProfiles.slice(i, i + BATCH_SIZE));
  }

  return { sellers, buyers };
}

// =========================
// 2. CATEGORIES
// =========================
async function populateCategories() {
  console.log("📁 Populating Categories...");
  const items = categoriesList.map(name => ({
    name,
    slug: name.toLowerCase().replace(/ /g, "-").replace(/&/g, "and")
  }));
  const { data } = await supabase.from("categories").upsert(items, { onConflict: "slug" }).select();
  return data.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.id }), {});
}

// =========================
// 3. PRODUCTS & VARIANTS
// =========================
async function populateProducts(sellers, catMap) {
  console.log("🏷️ Populating Products...");
  const products = [];
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const seller = sellers[Math.floor(Math.random() * sellers.length)];
    const catName = categoriesList[Math.floor(Math.random() * categoriesList.length)];
    const name = faker.commerce.productName();
    
    products.push({
      name,
      slug: faker.helpers.slugify(name + "-" + faker.string.alphanumeric(6) + "-" + i).toLowerCase(),
      seller_id: seller.id,
      category_id: catMap[catName],
      brand: faker.company.name(),
      short_description: faker.commerce.productDescription(),
      full_description: faker.lorem.paragraphs(2),
      price_cents: Math.floor(Math.random() * 20000) + 1000,
      keywords: [faker.commerce.productAdjective(), faker.commerce.department()],
      image: `https://picsum.photos/seed/prod_${i}/600/600`,
      rating_stars: (Math.random() * 2 + 3).toFixed(1),
      rating_count: Math.floor(Math.random() * 500)
    });
  }

  const createdProducts = [];
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const { data, error } = await supabase.from("products").insert(products.slice(i, i + BATCH_SIZE)).select("id, name, price_cents");
    if (error) {
        console.error("Product Error:", error.message);
        continue;
    }
    if (data) createdProducts.push(...data);
  }

  console.log("🎨 Populating Variants & Images...");
  const variants = [];
  const images = [];

  for (const p of createdProducts) {
    for (let v = 0; v < 2; v++) {
      variants.push({
        product_id: p.id,
        sku: `SKU-${p.id.slice(0,5)}-${v}-${faker.string.alphanumeric(3)}`,
        color: faker.color.human(),
        size: ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
        price_cents: p.price_cents,
        stock_quantity: 50
      });
    }
    for (let img = 0; img < 3; img++) {
      images.push({
        product_id: p.id,
        image_url: `https://picsum.photos/seed/${p.id}_${img}/600/800`,
        sort_order: img
      });
    }
  }

  for (let i = 0; i < variants.length; i += BATCH_SIZE * 2) {
    const { error } = await supabase.from("product_variants").insert(variants.slice(i, i + BATCH_SIZE * 2));
    if (error) console.error("Variant Error:", error.message);
  }
  for (let i = 0; i < images.length; i += BATCH_SIZE * 2) {
    const { error } = await supabase.from("product_images").insert(images.slice(i, i + BATCH_SIZE * 2));
    if (error) console.error("Image Error:", error.message);
  }

  const { data: vData } = await supabase.from("product_variants").select("id, product_id, price_cents");
  return { products: createdProducts, variants: vData || [] };
}

// =========================
// 4. COMMERCE (ORDERS & REVIEWS)
// =========================
async function populateCommerce(buyers, products, variants) {
  if (!variants.length) return;
  console.log("🛒 Populating Orders & Reviews...");
  
  const orders = [];
  const orderItems = [];
  const reviews = [];

  for (const buyer of buyers) {
    const orderId = faker.string.uuid();
    orders.push({
      id: orderId,
      user_id: buyer.id,
      status: "delivered",
      payment_status: "paid",
      total_cents: 5000
    });

    const v = variants[Math.floor(Math.random() * variants.length)];
    orderItems.push({
      order_id: orderId,
      product_id: v.product_id,
      variant_id: v.id,
      product_name: faker.commerce.productName(),
      price_cents: v.price_cents,
      quantity: 1,
      total_cents: v.price_cents
    });

    reviews.push({
      product_id: v.product_id,
      user_id: buyer.id,
      rating: 5,
      review_text: faker.lorem.sentence(),
      is_verified: true
    });
  }

  await supabase.from("orders").insert(orders);
  await supabase.from("order_items").insert(orderItems);
  await supabase.from("product_reviews").insert(reviews);
}

async function runUltimateSeed() {
  const start = Date.now();
  console.log("🚀 ULTIMATE SEED STARTED");
  
  const { sellers, buyers } = await populateUsers();
  const catMap = await populateCategories();
  const { products, variants } = await populateProducts(sellers, catMap);
  await populateCommerce(buyers, products, variants);

  console.log(`🎉 FINISHED in ${((Date.now() - start)/1000).toFixed(2)}s`);
}

runUltimateSeed();