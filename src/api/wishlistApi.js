import { supabase } from "../supabaseClient";

const GUEST_WISHLIST_KEY = "guest_wishlist";
const WISHLIST_TABLE = "wishlists";

function readGuestWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const ids = JSON.parse(window.localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(productIds) {
  if (typeof window === "undefined") return;

  const uniqueIds = [...new Set(productIds.filter(Boolean))];
  window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(uniqueIds));
}

export const WishlistAPI = {
  getGuestWishlist: readGuestWishlist,

  setGuestWishlist: writeGuestWishlist,

  clearGuestWishlist() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(GUEST_WISHLIST_KEY);
    }
  },

  async load() {
    const { data, error } = await supabase
      .from(WISHLIST_TABLE)
      .select("product_id");

    if (error) throw error;

    return [...new Set((data || []).map((item) => item.product_id).filter(Boolean))];
  },

  async add(productId) {
    if (!productId) return;

    const { error } = await supabase.from(WISHLIST_TABLE).insert({
      product_id: productId,
    });

    if (error && error.code !== "23505") throw error;
  },

  async remove(productId) {
    if (!productId) return;

    const { error } = await supabase
      .from(WISHLIST_TABLE)
      .delete()
      .eq("product_id", productId);

    if (error) throw error;
  },

  async removeMany(productIds = []) {
    const ids = [...new Set(productIds.filter(Boolean))];
    if (!ids.length) return;

    const { error } = await supabase
      .from(WISHLIST_TABLE)
      .delete()
      .in("product_id", ids);

    if (error) throw error;
  },
};
