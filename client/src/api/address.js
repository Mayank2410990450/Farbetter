import api from "./apiClient";

export const fetchAddresses = async () => {
  const res = await api.get("/addresses");
  return res.data.addresses || res.data;
};

export const addAddress = async (payload) => {
  const res = await api.post("/addresses", payload);
  return res.data;
};

export const setDefaultAddress = async (id) => {
  const res = await api.put(`/addresses/default/${id}`);
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await api.delete(`/addresses/${id}`);
  return res.data;
};
