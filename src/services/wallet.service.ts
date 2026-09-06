import type {
  ApiResponse,
  DepositHistoryItem,
  DepositQrSession,
  DepositRequest,
  PageResponse,
  SliceResponse,
  WalletSummary,
  WalletTransaction,
  WalletTransactionCategory,
  WithdrawalRequest,
} from "@/types";

import { api } from "./api";

function unwrapData<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

type WalletTransactionHistoryPayload = {
  currentPage: number;
  pageSize: number;
  data: WalletTransaction[];
  hasNext?: boolean;
  hasPrevious?: boolean;
  pageNumbers?: number[];
  totalPages?: number;
};

function normalizeTransactionHistory(
  payload: WalletTransactionHistoryPayload,
): SliceResponse<WalletTransaction> {
  const currentPage = payload.currentPage ?? 0;
  const currentPageNumber = currentPage + 1;
  const legacyTotalPages = Number.isFinite(payload.totalPages)
    ? Math.max(0, payload.totalPages ?? 0)
    : null;
  const hasNext = typeof payload.hasNext === "boolean"
    ? payload.hasNext
    : legacyTotalPages !== null && currentPageNumber < legacyTotalPages;
  const hasPrevious = typeof payload.hasPrevious === "boolean"
    ? payload.hasPrevious
    : currentPageNumber > 1;

  let pageNumbers = payload.pageNumbers?.filter(
    (pageNumber) => Number.isInteger(pageNumber) && pageNumber > 0,
  );

  // Tương thích tạm với backend PageResponse cũ đang chạy trong lúc chưa restart.
  if (!pageNumbers?.length && legacyTotalPages !== null) {
    const groupStart = Math.floor((currentPageNumber - 1) / 3) * 3 + 1;
    const groupEnd = Math.min(groupStart + 2, legacyTotalPages);
    pageNumbers = Array.from(
      { length: Math.max(0, groupEnd - groupStart + 1) },
      (_, index) => groupStart + index,
    );
  }

  return {
    currentPage,
    pageSize: payload.pageSize,
    hasNext,
    hasPrevious,
    pageNumbers: pageNumbers?.length ? pageNumbers.slice(0, 3) : [currentPageNumber],
    data: payload.data ?? [],
  };
}

export const walletService = {
  async getMyWallet(): Promise<WalletSummary> {
    const response = await api.get<ApiResponse<WalletSummary>>("/api/v1/wallet");
    return unwrapData(response.data, "Không nhận được thông tin ví");
  },

  async getTransactions(
    page = 1,
    size = 20,
    category: WalletTransactionCategory = "ALL",
  ): Promise<SliceResponse<WalletTransaction>> {
    const response = await api.get<ApiResponse<WalletTransactionHistoryPayload>>(
      "/api/v1/wallet/transactions",
      { params: { page, size, category } },
    );
    return normalizeTransactionHistory(
      unwrapData(response.data, "Không nhận được lịch sử giao dịch"),
    );
  },

  async getSellerTransactions(
    page = 1,
    size = 20,
    category: WalletTransactionCategory = "ALL",
  ): Promise<SliceResponse<WalletTransaction>> {
    const response = await api.get<ApiResponse<WalletTransactionHistoryPayload>>(
      "/api/v1/seller/wallet/transactions",
      { params: { page, size, category } },
    );
    return normalizeTransactionHistory(
      unwrapData(response.data, "Không nhận được lịch sử tài chính người bán"),
    );
  },

  async getDepositHistory(page = 1, size = 10): Promise<PageResponse<DepositHistoryItem>> {
    const response = await api.get<ApiResponse<PageResponse<DepositHistoryItem>>>(
      "/api/v1/wallet/deposits",
      { params: { page, size } },
    );
    return unwrapData(response.data, "Không nhận được lịch sử nạp tiền");
  },

  async createDeposit(payload: DepositRequest): Promise<DepositQrSession> {
    const response = await api.post<ApiResponse<DepositQrSession>>(
      "/api/v1/wallet/deposits",
      payload,
    );
    return unwrapData(response.data, "Không nhận được mã QR nạp tiền");
  },

  async getDepositStatus(transactionCode: string): Promise<DepositQrSession> {
    const response = await api.get<ApiResponse<DepositQrSession>>(
      `/api/v1/wallet/deposits/${encodeURIComponent(transactionCode)}`,
    );
    return unwrapData(response.data, "Không nhận được trạng thái nạp tiền");
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
