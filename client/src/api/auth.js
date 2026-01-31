import api from "./apiClient";

export const registerUser = async (data) => {
  const res = await api.post("/user/register", data);
  // Store token from registration response
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/user/login", data);
  // Store token from login response
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data.user || res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/user/profile", data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.get("/user/logout");
  // Clear token from localStorage on logout
  localStorage.removeItem("token");
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/user/password/forgot", { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await api.put(`/user/password/reset/${token}`, { password });
  return res.data;
};
