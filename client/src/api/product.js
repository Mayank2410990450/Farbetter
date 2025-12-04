import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

import api from "./apiClient";

export const fetchProducts = async (category = "") => {
  const url = category ? `/products?category=${category}` : "/products";
  const res = await api.get(url);
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
