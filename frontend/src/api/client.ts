import axios from 'axios';

// Di production (Railway + Vercel): set VITE_API_URL=https://your-backend.railway.app/api/v1
// Di development: proxy Vite sudah forward /api → localhost:3000, jadi cukup '/api/v1'
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect to login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
