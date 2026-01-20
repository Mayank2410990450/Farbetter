import apiClient from "./apiClient";

// Admin: Create Coupon
export const createCoupon = async (couponData) => {
    const response = await apiClient.post("/coupons", couponData);
    return response.data;
};

// Admin: Get All Coupons
export const getAllCoupons = async () => {
    const response = await apiClient.get("/coupons");
    return response.data;
};

// Admin: Delete Coupon
export const deleteCoupon = async (id) => {
    const response = await apiClient.delete(`/coupons/${id}`);
    return response.data;
};

// User: Validate Coupon
export const validateCoupon = async (code, cartTotal) => {
    const response = await apiClient.post("/coupons/validate", { code, cartTotal });
    return response.data;
};
