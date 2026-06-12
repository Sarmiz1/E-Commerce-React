import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../queries/queryClient";

const COLLECTIONS = {
  "new-arrivals": {
    keywords: ["new", "arrivals", "latest", "fresh", "2024", "2025"],
    sort: "newest",
  },
  "hot-deals": {
    keywords: ["sale", "deal", "discount", "offer", "budget"],
    onSale: true,
    sort: "price-asc",
  },
  trending: {
    keywords: ["trending", "popular", "hot", "viral", "bestseller", "top"],
    minRating: 4,
    sort: "trending",
  },
  "high-fashion": {
    keywords: ["fashion", "luxury", "designer", "premium", "couture", "style", "vogue"],
    sort: "rating",
  },
  sneakers: {
    keywords: ["sneakers", "shoes", "footwear", "kicks", "trainers", "boots"],
    sort: "trending",
  },
  electronics: {
    keywords: ["electronics", "tech", "gadget", "phone", "laptop", "computer", "device", "audio"],
    sort: "trending",
  },
  "beauty-care": {
    keywords: ["beauty", "skincare", "makeup", "cosmetic", "haircare", "care", "wellness", "fragrance"],
    sort: "trending",
  },
  "flash-sales": {
    keywords: ["flash", "sale", "deal", "limited", "clearance", "offer"],
    onSale: true,
    sort: "newest",
  },
  "members-only": {
    keywords: ["premium", "exclusive", "luxury", "vip", "members", "limited"],
    minRating: 4.5,
    sort: "rating",
  },
  categories: {
    sort: "newest",
  },
  "black-friday": {
    keywords: ["sale", "deal", "discount", "offer", "black friday", "clearance"],
    onSale: true,
    sort: "price-asc",
  },
  fashion: {
    keywords: ["fashion", "clothing", "apparel", "dress", "shirt", "pants", "jacket", "style", "wear"],
    sort: "trending",
  },
  "kids-toys": {
    keywords: ["kids", "toys", "children", "baby", "play", "games", "educational"],
    sort: "trending",
  },
};

export const collectionProductsLoader = (collectionKey) => async () =>
  queryClient.ensureQueryData(
    ProductsAPI.getCollection({
      ...(COLLECTIONS[collectionKey] || {}),
      limit: 120,
    }),
  );
