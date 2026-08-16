import type {
  ApiResponse,
  PageResponse,
  ProductDetail,
  ProductListFilters,
  ProductReviewPage,
  ProductSummary,
} from "@/types";

import { api } from "./api";

function unwrapProducts(response: ApiResponse<ProductSummary[]>): ProductSummary[] {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được danh sách sản phẩm");
  }

  return response.data;
}

function unwrapProductPage(
  response: ApiResponse<PageResponse<ProductSummary>>,
): PageResponse<ProductSummary> {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được danh sách sản phẩm");
  }

  return response.data;
}

function unwrapProduct(response: ApiResponse<ProductDetail>): ProductDetail {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được thông tin sản phẩm");
  }

  return response.data;
}

function unwrapProductReviews(
  response: ApiResponse<ProductReviewPage>,
): ProductReviewPage {
  if (!response.success || !response.data) {
    throw new Error(response.message || "Không nhận được danh sách đánh giá");
  }

  return response.data;
}

export const productService = {
  async getBySlug(slug: string): Promise<ProductDetail> {
    const response = await api.get<ApiResponse<ProductDetail>>(
      `/api/v1/products/slug/${encodeURIComponent(slug)}`,
    );

    return unwrapProduct(response.data);
  },

  async getAll(page = 0, size = 12): Promise<PageResponse<ProductSummary>> {
    const response = await api.get<ApiResponse<PageResponse<ProductSummary>>>(
      "/api/v1/products",
      { params: { page, size } },
    );

    return unwrapProductPage(response.data);
  },

  async search(
    filters: ProductListFilters,
    page = 0,
    size = 12,
  ): Promise<PageResponse<ProductSummary>> {
    const response = await api.post<ApiResponse<PageResponse<ProductSummary>>>(
      "/api/v1/products/search",
      filters,
      { params: { page, size } },
    );

    return unwrapProductPage(response.data);
  },

  async getByShopId(shopId: number): Promise<ProductSummary[]> {
    const response = await api.get<ApiResponse<ProductSummary[]>>(
      `/api/v1/products/shop/${shopId}`,
    );

    return unwrapProducts(response.data);
  },

  async getReviews(
    productId: number,
    page = 0,
    size = 10,
  ): Promise<ProductReviewPage> {
    const response = await api.get<ApiResponse<ProductReviewPage>>(
      `/api/v1/product-reviews/product/${productId}`,
      { params: { page, size } },
    );

    return unwrapProductReviews(response.data);
  },
};
