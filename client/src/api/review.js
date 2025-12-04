import api from "./apiClient";

// Fetch reviews for a product
export const fetchProductReviews = async (productId, options = {}) => {
  const { sort = "latest", rating, page = 1, limit = 5 } = options;
  const params = new URLSearchParams();
  if (sort) params.append("sort", sort);
  if (rating) params.append("rating", rating);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const res = await api.get(`/reviews/${productId}?${params.toString()}`);
  return res.data;
};

// Add a review to a product
export const submitReview = async (productId, rating, comment) => {
  const res = await api.post(`/reviews/${productId}`, {
    rating,
    comment,
  });
  return res.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};
