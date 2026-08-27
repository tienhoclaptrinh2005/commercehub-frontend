import type {
  ApiResponse,
  DeliveredAsset,
  OrderDetail,
  OrderSummary,
  SpringPage,
} from "@/types";

import { api } from "./api";

function unwrapData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const orderService = {
  async getMyOrders(
    page = 0,
    size = 10,
    orderCode?: string,
  ): Promise<SpringPage<OrderSummary>> {
    const response = await api.get<ApiResponse<SpringPage<OrderSummary>>>(
      "/api/v1/orders",
      {
        params: {
          page,
          size,
          sort: "placedAt,desc",
          orderCode: orderCode?.trim() || undefined,
        },
      },
    );

    return unwrapData(response.data, "Không nhận được lịch sử đơn hàng");
  },

  async getDetail(orderId: number): Promise<OrderDetail> {
    const response = await api.get<ApiResponse<OrderDetail>>(
      `/api/v1/orders/${orderId}`,
    );
    return unwrapData(response.data, "Không nhận được chi tiết đơn hàng");
  },

  async getDeliveredAssets(orderId: number): Promise<DeliveredAsset[]> {
    const response = await api.get<ApiResponse<DeliveredAsset[]>>(
      `/api/v1/orders/${orderId}/assets`,
    );
    return unwrapData(response.data, "Không nhận được nội dung giao hàng");
  },
};
