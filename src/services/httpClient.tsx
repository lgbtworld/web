import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { serviceURL } from "../appSettings";

const normalizeAuthHeader = (token: string | null): string | null => {
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const readAuthToken = (): string | null => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }
  const localToken = localStorage.getItem("authToken");
  if (localToken) {
    return localToken;
  }
  const cookieToken = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("authToken="))
    ?.split("=")[1];
  return cookieToken ? decodeURIComponent(cookieToken) : null;
};

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000000,
    });

    // Request interceptor (örneğin token ekleme)
    this.instance.interceptors.request.use((config) => {
      const skipAuth = (config.headers as any)?.["X-Skip-Auth"] === "1";
      if (skipAuth) {
        if (config.headers) {
          delete (config.headers as any)["X-Skip-Auth"];
        }
        return config;
      }

      const token = readAuthToken();
      const authHeader = normalizeAuthHeader(token);
      if (authHeader) config.headers["Authorization"] = authHeader;
      return config;
    });

    // Response interceptor (örneğin 401 yakalama)
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Unauthorized — redirecting to login.");
          //localStorage.removeItem("authToken");
          // window.location.href = "/login"; // istersen aktif et
        }
        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const httpClient = new HttpClient(serviceURL[0]).getInstance();
