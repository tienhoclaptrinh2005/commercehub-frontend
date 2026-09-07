import type {
  ApiResponse,
  PageResponse,
  PublicShopFilters,
  PublicShopSummary,
  ShopApplication,
  ShopApplicationRequest,
} from "@/types";

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

function unwrapShopPage(
  response: ApiResponse<PageResponse<PublicShopSummary>>,
): PageResponse<PublicShopSummary> {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không thể tải danh sách người bán");
  }
  return response.data;
}

export const shopService = {
  async getPublicShops(
    filters: PublicShopFilters = {},
    page = 0,
    size = 8,
  ): Promise<PageResponse<PublicShopSummary>> {
    const response = await api.get<ApiResponse<PageResponse<PublicShopSummary>>>(
      "/api/v1/shops",
      {
        params: {
          page,
          size,
          keyword: filters.keyword,
          categoryId: filters.categoryId,
          sort: filters.sort ?? "trusted",
        },
      },
    );
    return unwrapShopPage(response.data);
  },

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
