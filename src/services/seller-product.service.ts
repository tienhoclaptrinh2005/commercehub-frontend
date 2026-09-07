import type {
  ApiResponse,
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
};
