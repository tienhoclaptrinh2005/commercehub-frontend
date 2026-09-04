import type {
  ApiResponse,
  DeliveredAsset,
  OrderDetail,
  OrderSummary,
  SpringSlice,
} from "@/types";

import { api } from "./api";

function unwrapData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export interface OrderHistoryFilters {
  orderCode?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface OrderHistoryCursor {
  beforePlacedAt: string;
  beforeId: number;
}

export const orderService = {
  async getMyOrders(
    cursor: OrderHistoryCursor | null = null,
    size = 10,
    filters: OrderHistoryFilters = {},
  ): Promise<SpringSlice<OrderSummary>> {
    const response = await api.get<ApiResponse<SpringSlice<OrderSummary>>>(
      "/api/v1/orders",
      {
        params: {
          size,
          beforePlacedAt: cursor?.beforePlacedAt,
          beforeId: cursor?.beforeId,
          orderCode: filters.orderCode?.trim() || undefined,
          status: filters.status || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        },
      },
    );

    return unwrapData(response.data, "Không nhận được lịch sử đơn hàng");
  },

  async getDetail(orderCode: string): Promise<OrderDetail> {
    const response = await api.get<ApiResponse<OrderDetail>>(
      `/api/v1/orders/${encodeURIComponent(orderCode)}`,
    );
    return unwrapData(response.data, "Không nhận được chi tiết đơn hàng");
  },

  async getDeliveredAssets(orderCode: string): Promise<DeliveredAsset[]> {
    const response = await api.get<ApiResponse<DeliveredAsset[]>>(
      `/api/v1/orders/${encodeURIComponent(orderCode)}/assets`,
    );
    return unwrapData(response.data, "Không nhận được nội dung giao hàng");
  },
};
