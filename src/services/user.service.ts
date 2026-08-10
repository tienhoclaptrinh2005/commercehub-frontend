import type {
  ApiResponse,
  ChangePasswordRequest,
  PublicUserProfile,
  UpdateAvatarRequest,
  UpdateProfileRequest,
  UserLevel,
  UserProfile,
} from "@/types";

import { api } from "./api";

function unwrapData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

function ensureSuccess(response: ApiResponse<unknown>, fallback: string): void {
  if (!response.success) {
    throw new Error(response.message || fallback);
  }
}

export const userService = {
  async getPublicProfile(username: string): Promise<PublicUserProfile> {
    const response = await api.get<ApiResponse<PublicUserProfile>>(
      `/api/v1/users/${encodeURIComponent(username)}`,
    );
    return unwrapData(response.data, "Không nhận được thông tin người dùng");
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/users/me/change-password",
      payload,
    );
    ensureSuccess(response.data, "Không thể đổi mật khẩu");
  },

  async getLevels(): Promise<UserLevel[]> {
    const response = await api.get<ApiResponse<UserLevel[]>>("/api/v1/users/levels");
    return unwrapData(response.data, "Không nhận được danh sách cấp độ");
  },

  async updateUsername(newUsername: string): Promise<void> {
    const response = await api.put<ApiResponse<null>>(
      "/api/v1/users/me/username",
      null,
      { params: { newUsername } },
    );
    ensureSuccess(response.data, "Không thể cập nhật username");
  },

  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>("/api/v1/users/me");
    return unwrapData(response.data, "Không nhận được thông tin hồ sơ");
  },

  async updateMyProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>(
      "/api/v1/users/me",
      payload,
    );
    return unwrapData(response.data, "Không nhận được hồ sơ sau khi cập nhật");
  },

  async updateAvatar(payload: UpdateAvatarRequest): Promise<UserProfile> {
    const response = await api.patch<ApiResponse<UserProfile>>(
      "/api/v1/users/me/avatar",
      payload,
    );
    return unwrapData(response.data, "Không nhận được ảnh đại diện sau khi cập nhật");
  },
};

