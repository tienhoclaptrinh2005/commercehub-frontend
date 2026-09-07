import type {
  ApiResponse,
  CreateSellerProductPayload,
  PageResponse,
  ProductSummary,
  SellerProductFilters,
  SellerProductListItem,
} from "@/types";

import { api } from "./api";

function unwrapProductPage(
  response: ApiResponse<PageResponse<SellerProductListItem>>,
): PageResponse<SellerProductListItem> {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được danh sách sản phẩm của gian hàng");
  }
  return response.data;
}

function unwrapProduct(response: ApiResponse<ProductSummary>): ProductSummary {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không thể cập nhật trạng thái sản phẩm");
  }
  return response.data;
}

export const sellerProductService = {
  async getMyProducts(
    filters: SellerProductFilters,
  ): Promise<PageResponse<SellerProductListItem>> {
    const response = await api.get<ApiResponse<PageResponse<SellerProductListItem>>>(
      "/api/v1/seller/products",
      { params: filters },
    );
    return unwrapProductPage(response.data);
  },

  async updateStatus(
    productId: number,
    status: "ACTIVE" | "INACTIVE",
  ): Promise<ProductSummary> {
    const response = await api.put<ApiResponse<ProductSummary>>(
      `/api/v1/seller/products/${productId}`,
      { status },
    );
    return unwrapProduct(response.data);
  },

  async createProduct(payload: CreateSellerProductPayload): Promise<ProductSummary> {
    const response = await api.post<ApiResponse<ProductSummary>>(
      "/api/v1/seller/products",
      payload,
    );
    return unwrapProduct(response.data);
  },

  async uploadInventory(variantId: number, rawAssets: string[]): Promise<number> {
    const response = await api.post<ApiResponse<number>>(
      "/api/v1/seller/products/assets/inventory",
      { variantId, rawAssets },
    );
    if (!response.data.success || response.data.data == null) {
      throw new Error(response.data.message || "Không thể nạp dữ liệu kho");
    }
    return response.data.data;
  },
};
