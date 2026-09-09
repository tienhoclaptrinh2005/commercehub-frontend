import type {
  ApiResponse,
  CompleteProductImageUpload,
  CreateSellerProductPayload,
  PageResponse,
  ProductSummary,
  PresignProductImageUpload,
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

  async uploadProductImage(file: File): Promise<CompleteProductImageUpload> {
    const presignResponse = await api.post<ApiResponse<PresignProductImageUpload>>(
      "/api/v1/seller/uploads/product-images/presign",
      {
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    );
    const presign = presignResponse.data.data;
    if (!presignResponse.data.success || !presign) {
      throw new Error(presignResponse.data.message || "Không thể tạo đường dẫn tải ảnh");
    }

    const abortController = new AbortController();
    const timeout = window.setTimeout(() => abortController.abort(), 60_000);
    try {
      // Do not use the shared Axios API client here: its JWT and JSON headers
      // must never be sent to Cloudflare's signed PUT URL.
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
        signal: abortController.signal,
      });
      if (!uploadResponse.ok) {
        throw new Error("Cloudflare R2 từ chối tải ảnh. Vui lòng kiểm tra CORS và thử lại.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Tải ảnh quá thời gian 60 giây. Vui lòng thử lại.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }

    const completeResponse = await api.post<ApiResponse<CompleteProductImageUpload>>(
      "/api/v1/seller/uploads/product-images/complete",
      { objectKey: presign.objectKey },
    );
    const completed = completeResponse.data.data;
    if (!completeResponse.data.success || !completed) {
      throw new Error(completeResponse.data.message || "Không thể xác minh ảnh vừa tải lên");
    }
    return completed;
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
