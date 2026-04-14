import { ProductsAPI } from "../api/productsApi";

export const fetchLoader = async () => {
  try {
    const products = await ProductsAPI.getAll();
    return products;
  } catch {
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