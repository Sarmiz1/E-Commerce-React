import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const MODEL = "openrouter/free";

// ── System Prompt ─────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are Woosho AI — an elite, hyper-intelligent shopping assistant for Woosho, Nigeria's #1 premium e-commerce marketplace. You are warm, persuasive, knowledgeable, and laser-focused on helping users shop smarter.

CAPABILITIES:
- Search live product database with search_products tool
- Recommend products based on budget (₦ Naira), style, occasion, or need
- Add items to cart with add_to_cart tool
- Guide users to checkout with go_to_checkout tool
- Answer questions about products, brands, shipping, returns

RULES:
1. ALWAYS call search_products before recommending any product — never invent products or prices
2. After searching, present results conversationally: highlight key features, value for money, and why it fits the user's need
3. When a user says "add to cart", "buy this", "get it" or similar — call add_to_cart immediately
4. When user says "checkout", "pay now", "proceed" — call go_to_checkout
5. Be concise but insightful. No bullet-point walls. Max 3 sentences of prose per response
6. Use ₦ for all prices. Format: ₦45,000
7. If search returns 0 results, suggest alternatives or ask for clarification
8. Remember context — if user said budget is ₦20,000, keep that in mind for the whole conversation`;

// ── Tool Definitions ──────────────────────────────────────────────────────────
export const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the live Woosho product database. ALWAYS call this before recommending any product.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords (product name, brand, type)" },
          category: { type: "string", description: "Category filter: fashion, electronics, beauty, sneakers, kids, sports, home" },
          maxPrice: { type: "number", description: "Maximum price in Naira (NOT cents)" },
          minRating: { type: "number", description: "Minimum rating (1-5)" },
          limit: { type: "number", description: "Number of results to return. Default 4, max 6" },
          sortBy: { type: "string", enum: ["price_asc", "price_desc", "rating", "newest"], description: "Sort order" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a specific product to the user's cart. Call this when user wants to buy/add a product.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "The product ID from search results" },
          productName: { type: "string", description: "Product name for confirmation" },
          quantity: { type: "number", description: "Quantity to add. Default 1" }
        },
        required: ["productId", "productName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "go_to_checkout",
      description: "Navigate user to the checkout page to complete their purchase.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Confirmation message to show user" }
        },
        required: []
      }
    }
  }
];

// ── Product Search ────────────────────────────────────────────────────────────
export async function searchProducts({ query = "", category, maxPrice, minRating, limit = 4, sortBy }) {
  let q = supabase
    .from("products")
    .select("id, name, brand, price_cents, compare_at_price_cents, rating_stars, rating_count, image, category, slug, keywords, stock_quantity")
    .eq("is_active", true)
    .limit(Math.min(limit, 6));

  if (query) q = q.or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
  if (category) q = q.ilike("category", `%${category}%`);
  if (maxPrice) q = q.lte("price_cents", maxPrice * 100);
  if (minRating) q = q.gte("rating_stars", minRating);

  if (sortBy === "price_asc") q = q.order("price_cents", { ascending: true });
  else if (sortBy === "price_desc") q = q.order("price_cents", { ascending: false });
  else if (sortBy === "rating") q = q.order("rating_stars", { ascending: false });
  else if (sortBy === "newest") q = q.order("created_at", { ascending: false });
  else q = q.order("rating_stars", { ascending: false });

  const { data, error } = await q;
  if (error) return { error: "Database error", products: [] };

  const products = (data || []).map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand || "Woosho",
    price: Math.round(p.price_cents / 100),
    price_cents: p.price_cents,
    originalPrice: p.compare_at_price_cents ? Math.round(p.compare_at_price_cents / 100) : null,
    discount: p.compare_at_price_cents
      ? Math.round((1 - p.price_cents / p.compare_at_price_cents) * 100)
      : 0,
    rating: p.rating_stars || 4.5,
    reviews: p.rating_count || 0,
    image: p.image || `https://picsum.photos/seed/${p.id}/400/400`,
    category: p.category,
    slug: p.slug,
    inStock: (p.stock_quantity || 0) > 0,
  }));

  // Cache globally for UI rendering
  window.__WOOSHO_CACHE__ = window.__WOOSHO_CACHE__ || {};
  products.forEach(p => { window.__WOOSHO_CACHE__[p.id] = p; });

  return { totalFound: products.length, products };
}

// ── Execute Tool ──────────────────────────────────────────────────────────────
export async function executeTool(name, args) {
  if (name === "search_products") return await searchProducts(args);
  if (name === "add_to_cart") return { success: true, productId: args.productId, productName: args.productName, quantity: args.quantity || 1 };
  if (name === "go_to_checkout") return { navigate: true, path: "/checkout" };
  return { error: `Unknown tool: ${name}` };
}

// ── Call AI ───────────────────────────────────────────────────────────────────
export async function callWooshoAI(history, userRole, onToolCall) {
  const systemContent = SYSTEM_PROMPT + `\n\nUser Role: ${userRole.toUpperCase()}`;

  const messages = [
    { role: "system", content: systemContent },
    ...history,
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.55,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) throw new Error(`AI Error ${res.status}`);
  const data = await res.json();
  const msg = data.choices[0].message;

  if (!msg.tool_calls?.length) {
    return { text: msg.content, productIds: [], actions: [] };
  }

  // Process tool calls
  const toolResults = [];
  const productIds = [];
  const actions = [];

  for (const tc of msg.tool_calls) {
    const args = JSON.parse(tc.function.arguments || "{}");
    const result = await executeTool(tc.function.name, args);

    if (onToolCall) onToolCall(tc.function.name, args, result);

    if (result.products) result.products.forEach(p => productIds.push(p.id));
    if (tc.function.name === "add_to_cart" && result.success) actions.push({ type: "add_to_cart", ...result });
    if (tc.function.name === "go_to_checkout" && result.navigate) actions.push({ type: "checkout", path: result.path });

    toolResults.push({
      role: "tool",
      tool_call_id: tc.id,
      name: tc.function.name,
      content: JSON.stringify(result),
    });
  }

  // Follow-up call with tool results
  const followUp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [...messages, msg, ...toolResults],
      temperature: 0.55,
      max_tokens: 1200,
    }),
  });

  if (!followUp.ok) throw new Error(`AI Follow-up Error ${followUp.status}`);
  const followData = await followUp.json();

  return {
    text: followData.choices[0].message.content,
    productIds,
    actions,
  };
}
