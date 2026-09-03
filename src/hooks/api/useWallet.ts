"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import type {
  DepositHistoryItem,
  PageResponse,
  SliceResponse,
  WalletSummary,
  WalletTransaction,
  WalletTransactionCategory,
} from "@/types";

const EMPTY_TRANSACTIONS: SliceResponse<WalletTransaction> = {
  currentPage: 0,
  pageSize: 10,
  hasNext: false,
  hasPrevious: false,
  pageNumbers: [1],
  data: [],
};

export function useWalletSummary() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextWallet = await walletService.getMyWallet();
      setWallet(nextWallet);
      return nextWallet;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải số dư ví"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    walletService
      .getMyWallet()
      .then((nextWallet) => {
        if (!isCancelled) setWallet(nextWallet);
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setError(getApiErrorMessage(requestError, "Không thể tải số dư ví"));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshWallet = () => {
      void refresh();
    };
    window.addEventListener("commercehub:wallet-updated", refreshWallet);
    window.addEventListener("focus", refreshWallet);

    return () => {
      window.removeEventListener("commercehub:wallet-updated", refreshWallet);
      window.removeEventListener("focus", refreshWallet);
    };
  }, [refresh]);

  return { wallet, isLoading, error, refresh };
}

type TransactionHistoryLoader = (
  page: number,
  size: number,
  category: WalletTransactionCategory,
) => Promise<SliceResponse<WalletTransaction>>;

function useTransactionHistory(
  loadTransactions: TransactionHistoryLoader,
  page = 1,
  size = 10,
  category: WalletTransactionCategory = "ALL",
) {
  const [state, setState] = useState<{
    loadedPage: number;
    loadedCategory: WalletTransactionCategory;
    result: SliceResponse<WalletTransaction>;
    error: string | null;
  }>({
    loadedPage: 0,
    loadedCategory: "ALL",
    result: { ...EMPTY_TRANSACTIONS, pageSize: size },
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loadedPage: 0, error: null }));
    try {
      const nextResult = await loadTransactions(page, size, category);
      setState({ loadedPage: page, loadedCategory: category, result: nextResult, error: null });
      return nextResult;
    } catch (requestError) {
      setState({
        loadedPage: page,
        loadedCategory: category,
        result: { ...EMPTY_TRANSACTIONS, pageSize: size },
        error: getApiErrorMessage(
          requestError,
          "Không thể tải lịch sử giao dịch",
        ),
      });
      return null;
    }
  }, [category, loadTransactions, page, size]);

  useEffect(() => {
    let isCancelled = false;

    loadTransactions(page, size, category)
      .then((nextResult) => {
        if (!isCancelled) {
          setState({ loadedPage: page, loadedCategory: category, result: nextResult, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            loadedPage: page,
            loadedCategory: category,
            result: { ...EMPTY_TRANSACTIONS, pageSize: size },
            error: getApiErrorMessage(
              requestError,
              "Không thể tải lịch sử giao dịch",
            ),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [category, loadTransactions, page, size]);

  const isCurrentRequest = state.loadedPage === page && state.loadedCategory === category;

  return {
    result: isCurrentRequest
      ? state.result
      : { ...EMPTY_TRANSACTIONS, pageSize: size },
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
    refresh,
  };
}

export function useWalletTransactions(
  page = 1,
  size = 10,
  category: WalletTransactionCategory = "ALL",
) {
  return useTransactionHistory(walletService.getTransactions, page, size, category);
}

export function useSellerWalletTransactions(
  page = 1,
  size = 10,
  category: WalletTransactionCategory = "ALL",
) {
  return useTransactionHistory(
    walletService.getSellerTransactions,
    page,
    size,
    category,
  );
}

const EMPTY_DEPOSITS: PageResponse<DepositHistoryItem> = {
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

export function useDepositHistory(page = 1, size = 10) {
  const [state, setState] = useState<{
    loadedPage: number;
    result: PageResponse<DepositHistoryItem>;
    error: string | null;
  }>({ loadedPage: 0, result: { ...EMPTY_DEPOSITS, pageSize: size }, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loadedPage: 0, error: null }));
    try {
      const result = await walletService.getDepositHistory(page, size);
      setState({ loadedPage: page, result, error: null });
      return result;
    } catch (requestError) {
      setState({
        loadedPage: page,
        result: { ...EMPTY_DEPOSITS, pageSize: size },
        error: getApiErrorMessage(requestError, "Không thể tải lịch sử nạp tiền"),
      });
      return null;
    }
  }, [page, size]);

  useEffect(() => {
    let isCancelled = false;

    walletService
      .getDepositHistory(page, size)
      .then((result) => {
        if (!isCancelled) setState({ loadedPage: page, result, error: null });
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            loadedPage: page,
            result: { ...EMPTY_DEPOSITS, pageSize: size },
            error: getApiErrorMessage(requestError, "Không thể tải lịch sử nạp tiền"),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, size]);

  return {
    result: state.loadedPage === page ? state.result : { ...EMPTY_DEPOSITS, pageSize: size },
    isLoading: state.loadedPage !== page,
    error: state.loadedPage === page ? state.error : null,
    refresh,
  };
}
