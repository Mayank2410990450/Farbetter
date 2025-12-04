import api from "./apiClient";

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Products
export const fetchProducts = async () => {
  const res = await api.get(`/products`, { headers: getHeaders() });
  return res.data?.products || res.data?.data || [];
};

export const createProduct = async (formData) => {
  const res = await api.post(`/products/create`, formData, {
    headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateProduct = async (id, formData) => {
  const res = await api.put(`/products/update/${id}`, formData, {
    headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/delete/${id}`, {
    headers: getHeaders(),
  });
  return res.data;
};

// Categories
export const fetchCategories = async () => {
  const res = await api.get(`/categories`, { headers: getHeaders() });
  // Handle different response formats: { categories }, { data }, or array
  return res.data?.data || res.data?.categories || res.data || [];
};

export const createCategory = async (data) => {
  const res = await api.post(`/categories/create`, data, {
    headers: getHeaders(),
  });
  return res.data;
};

// Orders
export const fetchOrders = async () => {
  const res = await api.get(`/orders`, { headers: getHeaders() });
    // Handle different response formats: { orders }, { data }, or array
    return res.data?.data || res.data?.orders || res.data || [];
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.put(`/orders/${id}`, { orderStatus: status }, {
    headers: getHeaders(),
  });
  return res.data;
};

// Logs/Activity
export const fetchLogs = async () => {
  try {
    const res = await api.get(`/orders/logs`, { headers: getHeaders() });
    // server responds with { success: true, logs: [...] }
    return res.data?.logs || res.data?.data || res.data || [];
  } catch (err) {
    console.error('fetchLogs error:', err.response?.data || err.message);
    return [];
  }
};

export const updatePaymentLogStatus = async (logId, status) => {
  const res = await api.post(`/orders/logs/update-status`, { logId, status }, {
    headers: getHeaders(),
  });
  return res.data;
};

// Shipping Settings
export const fetchShippingSettings = async () => {
  const res = await api.get(`/shipping`);
  return res.data || null;
};

export const updateShippingSettings = async (payload) => {
  const res = await api.post(`/shipping`, payload, { headers: getHeaders() });
  return res.data;
};
