import axios from "axios";
import { clearAccessToken, getAccessToken } from "./token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register-school", "/auth/refresh"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error?.response?.status === 401;
    const url: string = error?.response?.config?.url ?? "";

    if (
      typeof window !== "undefined" &&
      isUnauthorized &&
      !AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint)) &&
      !window.location.pathname.startsWith("/login")
    ) {
      clearAccessToken();
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);