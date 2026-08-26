import type { ApiResponse, CheckoutRequest } from "@/types";

import { api } from "./api";

export const checkoutService = {
  async checkout(request: CheckoutRequest): Promise<number[]> {
    const response = await api.post<ApiResponse<number[]>>(
      "/api/v1/checkout/checkout",
      request,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể tạo đơn hàng");
    }
    return response.data.data;
  },
};
