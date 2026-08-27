import type {
  AddToCartRequest,
  ApiResponse,
  Cart,
  CartCheckoutRequest,
  UpdateCartItemRequest,
} from "@/types";

import { api } from "./api";

function unwrapCart(response: ApiResponse<Cart>, fallback: string): Cart {
  if (!response.success || !response.data) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const cartService = {
  async getMyCart(): Promise<Cart> {
    const response = await api.get<ApiResponse<Cart>>("/api/v1/cart");
    return unwrapCart(response.data, "Không thể tải giỏ hàng");
  },

  async addItem(request: AddToCartRequest): Promise<Cart> {
    const response = await api.post<ApiResponse<Cart>>(
      "/api/v1/cart/items",
      request,
    );
    return unwrapCart(response.data, "Không thể thêm sản phẩm vào giỏ");
  },

  async updateQuantity(
    itemId: number,
    request: UpdateCartItemRequest,
  ): Promise<Cart> {
    const response = await api.put<ApiResponse<Cart>>(
      `/api/v1/cart/items/${itemId}`,
      request,
    );
    return unwrapCart(response.data, "Không thể cập nhật số lượng");
  },

  async removeItem(itemId: number): Promise<Cart> {
    const response = await api.delete<ApiResponse<Cart>>(
      `/api/v1/cart/items/${itemId}`,
    );
    return unwrapCart(response.data, "Không thể xóa sản phẩm khỏi giỏ");
  },

  async clear(): Promise<void> {
    const response = await api.delete<ApiResponse<void>>("/api/v1/cart");
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể xóa giỏ hàng");
    }
  },

  async checkout(request: CartCheckoutRequest): Promise<number[]> {
    const response = await api.post<ApiResponse<number[]>>(
      "/api/v1/cart/checkout",
      request,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể thanh toán giỏ hàng");
    }
    return response.data.data;
  },
};
