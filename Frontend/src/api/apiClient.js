// src/api/apiClient.js
import axios from "axios";

// En CRA se usa process.env.REACT_APP_...
const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL,
});

// 👉 Interceptor para adjuntar automáticamente el token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // DRF TokenAuthentication → "Token <clave>"
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
