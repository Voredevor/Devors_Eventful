import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  get<T = unknown>(url: string, config = {}) {
    return this.axiosInstance.get<T, T>(url, config);
  }

  post<T = unknown>(url: string, data?: unknown, config = {}) {
    return this.axiosInstance.post<T, T>(url, data, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config = {}) {
    return this.axiosInstance.patch<T, T>(url, data, config);
  }

  delete<T = unknown>(url: string, config = {}) {
    return this.axiosInstance.delete<T, T>(url, config);
  }

  getInstance() {
    return this.axiosInstance;
  }
}

export const api = new ApiClient();
