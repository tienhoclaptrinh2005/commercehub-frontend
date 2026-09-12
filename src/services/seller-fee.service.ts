import type {
  ApiResponse,
  PageResponse,
  SellerFeeConfig,
  SellerFeeLedger,
  SellerFeeSummary,
} from "@/types";

import { api } from "./api";

function requireData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const sellerFeeService = {
  async getCurrentConfig(): Promise<SellerFeeConfig> {
    const response = await api.get<ApiResponse<SellerFeeConfig>>(
      "/api/v1/seller/fees/current-config",
    );
    return requireData(response.data, "Không nhận được cấu hình phí sàn");
  },

  async getMonthlySummary(year: number, month: number): Promise<SellerFeeSummary> {
    const response = await api.get<ApiResponse<SellerFeeSummary>>(
      "/api/v1/seller/fees/summary",
      { params: { year, month } },
    );
    return requireData(response.data, "Không nhận được tổng hợp phí sàn");
  },

  async getFeeHistory(page: number, size = 10): Promise<PageResponse<SellerFeeLedger>> {
    const response = await api.get<ApiResponse<PageResponse<SellerFeeLedger>>>(
      "/api/v1/seller/fees",
      { params: { page, size } },
    );
    return requireData(response.data, "Không nhận được lịch sử phí sàn");
  },
};
