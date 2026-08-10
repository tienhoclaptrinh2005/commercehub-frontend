import type { ApiResponse, ProductSummary } from "@/types";

import { api } from "./api";

function unwrapProducts(response: ApiResponse<ProductSummary[]>): ProductSummary[] {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được danh sách sản phẩm");
  }

  return response.data;
}

export const productService = {
  async getByShopId(shopId: number): Promise<ProductSummary[]> {
    const response = await api.get<ApiResponse<ProductSummary[]>>(
      `/api/v1/products/shop/${shopId}`,
    );

    return unwrapProducts(response.data);
  },
};
