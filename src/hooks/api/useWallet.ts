"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import type { PageResponse, WalletSummary, WalletTransaction } from "@/types";

const EMPTY_TRANSACTIONS: PageResponse<WalletTransaction> = {
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
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

export function useWalletTransactions(page = 1, size = 10) {
  const [state, setState] = useState<{
    loadedPage: number;
    result: PageResponse<WalletTransaction>;
    error: string | null;
  }>({
    loadedPage: 0,
    result: { ...EMPTY_TRANSACTIONS, pageSize: size },
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loadedPage: 0, error: null }));
    try {
      const nextResult = await walletService.getTransactions(page, size);
      setState({ loadedPage: page, result: nextResult, error: null });
      return nextResult;
    } catch (requestError) {
      setState({
        loadedPage: page,
        result: { ...EMPTY_TRANSACTIONS, pageSize: size },
        error: getApiErrorMessage(
          requestError,
          "Không thể tải lịch sử giao dịch",
        ),
      });
      return null;
    }
  }, [page, size]);

  useEffect(() => {
    let isCancelled = false;

    walletService
      .getTransactions(page, size)
      .then((nextResult) => {
        if (!isCancelled) {
          setState({ loadedPage: page, result: nextResult, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            loadedPage: page,
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
  }, [page, size]);

  return {
    result:
      state.loadedPage === page
        ? state.result
        : { ...EMPTY_TRANSACTIONS, pageSize: size },
    isLoading: state.loadedPage !== page,
    error: state.loadedPage === page ? state.error : null,
    refresh,
  };
}
