import { ProductsAPI } from "../api/productsApi";

export const productDetailsLoader = async ({ params }) => {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.productId);
    const product = isUUID 
      ? await ProductsAPI.getById(params.productId)
      : await ProductsAPI.getBySlug(params.productId);

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    const similarProducts = await ProductsAPI.getByKeywords(
      product.keywords
    );

    return {
      product,
      similarProducts: similarProducts.filter(
        (p) => p.id !== product.id
      ),
    };

  } catch {
    throw new Response("Failed to load product", {
      status: 500,
    });
  }
};