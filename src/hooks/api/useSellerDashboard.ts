"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { sellerDashboardService } from "@/services/seller-dashboard.service";
import type { SellerDashboardData } from "@/types";

export function useSellerDashboard(month: string) {
  const [state, setState] = useState<{
    loadedMonth: string;
    data: SellerDashboardData | null;
    error: string | null;
  }>({ loadedMonth: "", data: null, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loadedMonth: "", error: null }));
    try {
      const data = await sellerDashboardService.getDashboard(month);
      setState({ loadedMonth: month, data, error: null });
      return data;
    } catch (requestError) {
      setState({
        loadedMonth: month,
        data: null,
        error: getApiErrorMessage(requestError, "Không thể tải tổng quan bán hàng"),
      });
      return null;
    }
  }, [month]);

  useEffect(() => {
    let isCancelled = false;

    sellerDashboardService
      .getDashboard(month)
      .then((data) => {
        if (!isCancelled) setState({ loadedMonth: month, data, error: null });
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            loadedMonth: month,
            data: null,
            error: getApiErrorMessage(requestError, "Không thể tải tổng quan bán hàng"),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [month]);

  const isCurrentMonth = state.loadedMonth === month;

  return {
    data: isCurrentMonth ? state.data : null,
    error: isCurrentMonth ? state.error : null,
    isLoading: !isCurrentMonth,
    refresh,
  };
}
