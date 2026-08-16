import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
  sessionFromAuthResponse,
} from "@/lib/auth";
import type { ApiResponse, AuthResponse, AuthSession } from "@/types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ApiErrorBody {
  message?: string;
  code?: number;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<AuthSession> | null = null;

api.interceptors.request.use((config) => {
  const session = readAuthSession();
  if (session?.accessToken) {
    config.headers.Authorization = `${session.tokenType} ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const request = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.url?.includes("/api/v1/auth/")
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      refreshPromise ??= refreshClient
        .post<ApiResponse<AuthResponse>>("/api/v1/auth/refresh-token")
        .then((response) => {
          if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || "Không thể làm mới phiên đăng nhập");
          }

          const refreshedSession = sessionFromAuthResponse(response.data.data);
          saveAuthSession(refreshedSession);
          return refreshedSession;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const refreshedSession = await refreshPromise;
      request.headers.Authorization = `${refreshedSession.tokenType} ${refreshedSession.accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.",
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message;

    if (error.code === "ECONNABORTED") {
      return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
    }

    if (!error.response) {
      return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend và thử lại.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
