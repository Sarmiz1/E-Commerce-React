import { getData } from "./apiClients";

export const ProductsAPI = {
  getAll: () => getData("/products"),

  getById: (id) => getData(`/products/${id}`),

  getByKeywords: (keywordsArray) =>
    getData(`/products?keywords=${keywordsArray.join(",")}`),
};