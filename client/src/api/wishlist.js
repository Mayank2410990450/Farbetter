import axios from "./apiClient";

// Add product to wishlist
export const addToWishlist = async (productId) => {
  return axios.post("/wishlist/add", { productId }).then(res => res.data);
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  return axios.post("/wishlist/remove", { productId }).then(res => res.data);
};

// Get current user's wishlist
export const fetchWishlist = async () => {
  return axios.get("/wishlist").then(res => res.data);
};
