import api from "./apiClient";

export const fetchTestimonials = async () => {
    const res = await api.get("/testimonials");
    return res.data; // { success: true, testimonials: [] }
};

export const createTestimonial = async (formData) => {
    // formData must contain image file if present
    const res = await api.post("/testimonials", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const updateTestimonial = async (id, formData) => {
    const res = await api.put(`/testimonials/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const deleteTestimonial = async (id) => {
    const res = await api.delete(`/testimonials/${id}`);
    return res.data;
};
