import { getDeviceId, sessionFromAuthResponse } from "@/lib/auth";
import type {
  ApiResponse,
  AuthResponse,
  AuthSession,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from "@/types";

import { api, refreshAuthSession } from "./api";

function unwrapAuthResponse(response: ApiResponse<AuthResponse>): AuthSession {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được dữ liệu xác thực");
  }
  return sessionFromAuthResponse(response.data);
}

export const authService = {
  async login(credentials: Omit<LoginRequest, "deviceId">): Promise<AuthSession> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/login",
      {
        ...credentials,
        deviceId: getDeviceId(),
      },
    );
    return unwrapAuthResponse(response.data);
  },

  async register(payload: RegisterRequest): Promise<AuthSession> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/register",
      payload,
    );
    return unwrapAuthResponse(response.data);
  },

  async googleLogin(credential: string): Promise<AuthSession> {
    const payload: GoogleLoginRequest = {
      credential,
      deviceId: getDeviceId(),
    };
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/google",
      payload,
    );
    return unwrapAuthResponse(response.data);
  },

  async refresh(): Promise<AuthSession> {
    return refreshAuthSession();
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>("/api/v1/auth/logout");
  },
};
