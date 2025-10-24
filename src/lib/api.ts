import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    timeout: 20000,
});

// Globalni error interceptor – uvijek vraća Error s porukom
api.interceptors.response.use(r=>r, err=>{
    const msg = err?.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
});
