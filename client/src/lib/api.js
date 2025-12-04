import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        return response.data;
    },
};

// Products API
export const productsAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    updateStock: async (id, stockData) => {
        const response = await api.put(`/products/stock/${id}`, stockData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    uploadImage: async (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await api.post(`/products/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Categories API
export const categoriesAPI = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    create: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    update: async (id, categoryData) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};

export default api;
