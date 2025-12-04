import api from "./apiClient";

export const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data.categories || res.data;
};
