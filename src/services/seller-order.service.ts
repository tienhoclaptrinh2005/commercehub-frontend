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

export type SellerOrderDeliveryType = "INSTANT" | "PRE_ORDER";

export interface SellerOrderFilters {
  search?: string;
  deliveryType?: SellerOrderDeliveryType;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SellerOrderCursor {
  beforePlacedAt: string;
  beforeId: number;
}

export type DeliveryContentType = "ACCOUNT" | "KEY" | "MESSAGE" | "OTHER";

export interface CompleteSellerOrderItem {
  orderItemId: number;
  deliveryContentType: DeliveryContentType;
  deliveryContent: string;
  sellerNotes?: string;
}

export const sellerOrderService = {
  async getOrders(
    cursor: SellerOrderCursor | null = null,
    size = 10,
    filters: SellerOrderFilters = {},
  ): Promise<SpringSlice<OrderSummary>> {
    const response = await api.get<ApiResponse<SpringSlice<OrderSummary>>>(
      "/api/v1/seller/orders",
      {
        params: {
          size,
          beforePlacedAt: cursor?.beforePlacedAt,
          beforeId: cursor?.beforeId,
          search: filters.search?.trim() || undefined,
          deliveryType: filters.deliveryType,
          status: filters.status || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        },
      },
    );
    return unwrapData(response.data, "Không nhận được danh sách đơn bán");
  },

  async getDetail(orderId: number): Promise<OrderDetail> {
    const response = await api.get<ApiResponse<OrderDetail>>(
      `/api/v1/seller/orders/${orderId}`,
    );
    return unwrapData(response.data, "Không nhận được chi tiết đơn bán");
  },

  async getDeliveredAssets(orderId: number): Promise<DeliveredAsset[]> {
    const response = await api.get<ApiResponse<DeliveredAsset[]>>(
      `/api/v1/seller/orders/${orderId}/assets`,
    );
    return unwrapData(response.data, "Không nhận được thông tin tài khoản đã giao");
  },

  async accept(orderId: number): Promise<void> {
    await api.post(`/api/v1/seller/orders/${orderId}/accept`);
  },

  async reject(orderId: number, reason?: string): Promise<void> {
    await api.post(`/api/v1/seller/orders/${orderId}/reject`, null, {
      params: { reason: reason?.trim() || undefined },
    });
  },

  async cancel(orderId: number, reason?: string): Promise<void> {
    await api.post(`/api/v1/seller/orders/${orderId}/cancel`, null, {
      params: { reason: reason?.trim() || undefined },
    });
  },

  async complete(
    orderId: number,
    items: CompleteSellerOrderItem[],
  ): Promise<void> {
    await api.post(`/api/v1/seller/orders/${orderId}/complete`, { items });
  },
};
