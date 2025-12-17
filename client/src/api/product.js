

import api from "./apiClient";

export const fetchProducts = async (params = {}) => {
  // Support both old string (category) and new object styles
  let query = "";
  if (typeof params === "string") {
    query = params ? `?category=${params}` : "";
  } else {
    // params is object { category, keyword, page, limit }
    const urlParams = new URLSearchParams();
    if (params.category) urlParams.append("category", params.category);
    if (params.keyword) urlParams.append("keyword", params.keyword);
    if (params.page) urlParams.append("page", params.page);
    if (params.limit) urlParams.append("limit", params.limit);
    // Add other filters as needed
    if (params.sort) urlParams.append("sort", params.sort);

    // Convert to string
    const stringParams = urlParams.toString();
    if (stringParams) query = `?${stringParams}`;
  }

  const res = await api.get(`/products${query}`);
  // If backend returns { products, page, pages, total }, return it fully for pagination support
  // Otherwise return products array for backward compatibility
  if (res.data.products && (res.data.page || res.data.pages)) {
    return res.data;
  }
  return res.data.products || res.data;
};

// GET single product
export const fetchProduct = async (id) => {
  const res = await api.get(`/products/${id}`);
  // backend returns { success: true, product } — normalize to return the product object
  return res.data.product ?? res.data;
};

export const fetchProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data.product ?? res.data;
};

// GET categories
export const fetchCategories = async () => {
  const res = await api.get(`/categories`);
  return res.data;
};
