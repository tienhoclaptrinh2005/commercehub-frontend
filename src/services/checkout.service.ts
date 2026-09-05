import type { ApiResponse, CheckoutOrderReference, CheckoutRequest } from "@/types";

import { api } from "./api";

export const checkoutService = {
  async checkout(request: CheckoutRequest): Promise<CheckoutOrderReference[]> {
    const response = await api.post<ApiResponse<CheckoutOrderReference[]>>(
      "/api/v1/checkout",
      request,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể tạo đơn hàng");
    }
    return response.data.data;
  },
};
