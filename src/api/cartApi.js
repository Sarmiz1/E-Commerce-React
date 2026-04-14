// cartApi.js

import axios from "axios";
import { postData, putData, deleteData } from "./apiClients";

export const CartAPI = {
  load: () =>
    axios.get("/api/cart-items?expand=product"),

  add: (productId, quantity) =>
    postData("/api/cart-items", { productId, quantity }),

  updateQuantity: (itemId, quantity) =>
    putData(`/api/cart-items/${itemId}`, { quantity }),

  remove: (itemId) =>
    deleteData(`/api/cart-items/${itemId}`),

  clear: () =>
    deleteData("/api/cart-items"),

  // ✅ NEW — update delivery method
  updateDelivery: (deliveryData) =>
    putData("/api/cart/delivery", deliveryData),
};