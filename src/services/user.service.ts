import type {
  ApiResponse,
  ChangePasswordRequest,
  PresignAvatarImageUpload,
  PublicUserProfile,
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

  async uploadAvatar(file: File): Promise<UserProfile> {
    const presignResponse = await api.post<ApiResponse<PresignAvatarImageUpload>>(
      "/api/v1/users/me/avatar/uploads/presign",
      {
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    );
    const presign = unwrapData(
      presignResponse.data,
      "Không thể tạo đường dẫn tải ảnh đại diện",
    );

    const abortController = new AbortController();
    const timeout = window.setTimeout(() => abortController.abort(), 60_000);
    try {
      // Presigned URL chỉ nhận các header đã ký; không gửi JWT hay header JSON
      // của API client sang Cloudflare.
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Cache-Control": presign.cacheControl,
        },
        body: file,
        signal: abortController.signal,
      });
      if (!uploadResponse.ok) {
        throw new Error(
          "Cloudflare R2 từ chối tải ảnh. Vui lòng kiểm tra CORS và thử lại.",
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Tải ảnh quá thời gian 60 giây. Vui lòng thử lại.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }

    const completeResponse = await api.post<ApiResponse<UserProfile>>(
      "/api/v1/users/me/avatar/uploads/complete",
      { objectKey: presign.objectKey },
    );
    return unwrapData(
      completeResponse.data,
      "Không nhận được ảnh đại diện sau khi cập nhật",
    );
  },
};
