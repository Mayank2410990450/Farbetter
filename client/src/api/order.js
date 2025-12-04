// src/api/order.js
import axios from "./apiClient";

// Place a new order
export const placeOrder = async (orderData) => {
  const { data } = await axios.post("/orders", orderData);
  return data;
};

// Get user orders
export const getMyOrders = async () => {
  const { data } = await axios.get("/orders/my-orders");
  return data.orders;
};

// Get single order
export const fetchOrderById = async (orderId) => {
  const { data } = await axios.get(`/orders/${orderId}`);
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await axios.get(`/orders/${orderId}`);
  return data.order;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const { data } = await axios.put(`/orders/${orderId}/cancel`);
  return data;
};
