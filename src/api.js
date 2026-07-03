import axios from "axios";

// Agar Vercel'dagi .env o'qisa o'shani oladi, aks holda zaxira (fallback) sifatida tayyor linkdan foydalanadi
const API_URL ="https://soat.techinfo.uz";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
