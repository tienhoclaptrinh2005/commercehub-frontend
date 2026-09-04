import type { ApiResponse, ShopApplication, ShopApplicationRequest } from "@/types";

import { api } from "./api";

function unwrapApplication(
  response: ApiResponse<ShopApplication>,
  fallback: string,
): ShopApplication {
  if (!response.success || !response.data) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const shopService = {
  async register(payload: ShopApplicationRequest): Promise<ShopApplication> {
    const response = await api.post<ApiResponse<ShopApplication>>(
      "/api/v1/shops",
      payload,
    );
    return unwrapApplication(response.data, "Không thể gửi yêu cầu đăng ký bán hàng");
  },

  async getMyApplication(): Promise<ShopApplication> {
    const response = await api.get<ApiResponse<ShopApplication>>(
      "/api/v1/shops/me/application",
    );
    return unwrapApplication(response.data, "Không thể tải hồ sơ đăng ký bán hàng");
  },
};
