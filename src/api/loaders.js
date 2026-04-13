import axios from "axios";

// loaders/FetchLoader.js

const productsUrl = "/api/products";

export const fetchLoader = async () => {
  try {
    const response = await axios.get("/api/products");
    return response.data;
  } catch (error) {
    throw new Response("Failed to fetch object", {
      status: error.response?.status || 500,
    });
  }
};




// loaders/productDetailsLoader.js
export const productDetailsLoader = async ({ params }) => {
  try {
    const productRes = await axios.get(
      `/api/products/${params.productId}`
    );

    const product = productRes.data;

    console.log(product)

    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }

    const similarRes = await axios.get(
      `/api/products?keywords=${product.keywords.join(",")}`
    );
    

    return {
      product,
      similarProducts: similarRes.data.filter(
        (p) => p.id !== product.id
      ),
    };
  } catch (error) {
    throw new Response(
      error.response?.data?.message || "Failed to load product",
      { status: error.response?.status || 500 }
    );
  }
};