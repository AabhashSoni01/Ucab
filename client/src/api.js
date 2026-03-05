import axios from 'axios';

export const BACKEND_URL = 'http://localhost:8000';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const userToken  = localStorage.getItem('ucab_token');
  const adminToken = localStorage.getItem('ucab_admin_token');
  const token = adminToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ucab_token');
      localStorage.removeItem('ucab_user');
      localStorage.removeItem('ucab_admin_token');
      localStorage.removeItem('ucab_admin');
    }
    return Promise.reject(err);
  }
);

// Helper — converts /uploads/file.jpg → http://localhost:8000/uploads/file.jpg
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

export default API;