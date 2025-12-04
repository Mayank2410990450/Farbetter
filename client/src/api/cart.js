import api from "./apiClient";

export const addToCart = async (productId, quantity = 1) => {
  const res = await api.post("/cart/add", { productId, quantity });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const res = await api.put("/cart/update", { productId, quantity });
  return res.data;
};

export const removeCartItem = async (productId) => {
  const res = await api.delete(`/cart/remove/${productId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart/clear");
  return res.data;
};
