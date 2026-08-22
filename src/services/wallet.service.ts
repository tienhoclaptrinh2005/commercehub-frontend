import type {
  ApiResponse,
  PageResponse,
  WalletSummary,
  WalletTransaction,
  WithdrawalRequest,
} from "@/types";

import { api } from "./api";

function unwrapData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const walletService = {
  async getMyWallet(): Promise<WalletSummary> {
    const response = await api.get<ApiResponse<WalletSummary>>("/api/v1/wallet");
    return unwrapData(response.data, "Không nhận được thông tin ví");
  },

  async getTransactions(page = 1, size = 20): Promise<PageResponse<WalletTransaction>> {
    const response = await api.get<ApiResponse<PageResponse<WalletTransaction>>>(
      "/api/v1/wallet/transactions",
      { params: { page, size } },
    );
    return unwrapData(response.data, "Không nhận được lịch sử giao dịch");
  },

  async requestWithdrawal(payload: WithdrawalRequest): Promise<string> {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/wallet/withdraw",
      payload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể gửi yêu cầu rút tiền");
    }

    return response.data.message || "Yêu cầu rút tiền đã được gửi.";
  },
};
