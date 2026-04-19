import { ProductsAPI } from "../api/productsApi";

export const fetchProductsLoader = async () => {
  try {
    const products = await ProductsAPI.getAll();
    return products || [];
  } catch (err) {
    console.error("fetchProductsLoader Error:", err);
    throw new Response("Failed to fetch products", {
      status: 500,
    });
  }
};


export const cartRecommendationsLoader = async () => {
  try {
    const products = await ProductsAPI.getAll();

    return {
      recommendations: products.slice(0, 8),
    };

  } catch {
    throw new Response("Failed to load recommendations", {
      status: 500,
    });
  }
};

