import type {
  ApiResponse,
  SellerDashboardData,
  SellerNotificationData,
} from "@/types";

import { api } from "./api";

export type SellerNotificationCategory = "INSTANT_ORDERS" | "PRE_ORDERS" | "DISPUTES" | "WITHDRAWALS";

export const sellerDashboardService = {
  async getDashboard(month: string): Promise<SellerDashboardData> {
    const response = await api.get<ApiResponse<SellerDashboardData>>(
      "/api/v1/seller/dashboard",
      { params: { month } },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không nhận được dữ liệu tổng quan bán hàng");
    }

    return response.data.data;
  },

  async getNotifications(): Promise<SellerNotificationData> {
    const response = await api.get<ApiResponse<SellerNotificationData>>(
      "/api/v1/seller/dashboard/notifications",
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không nhận được thông báo bán hàng");
    }

    return response.data.data;
  },

  async markNotificationsRead(category: SellerNotificationCategory): Promise<SellerNotificationData> {
    const response = await api.post<ApiResponse<SellerNotificationData>>(
      `/api/v1/seller/dashboard/notifications/${category}/read`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể đánh dấu thông báo đã xem");
    }

    return response.data.data;
  },
};
