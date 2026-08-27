"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { orderService } from "@/services/order.service";
import type { OrderSummary, SpringPage } from "@/types";

function emptyPage(page: number, size: number): SpringPage<OrderSummary> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size,
    number: page,
    first: true,
    last: true,
    empty: true,
  };
}

export function useOrders(page: number, size = 10, orderCode = "") {
  const [reloadKey, setReloadKey] = useState(0);
  const normalizedOrderCode = orderCode.trim();
  const requestKey = `${page}:${size}:${normalizedOrderCode}:${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    result: SpringPage<OrderSummary>;
    error: string | null;
  }>({ requestKey: "", result: emptyPage(page, size), error: null });

  useEffect(() => {
    let cancelled = false;

    orderService
      .getMyOrders(page, size, normalizedOrderCode)
      .then((result) => {
        if (!cancelled) setState({ requestKey, result, error: null });
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState({
            requestKey,
            result: emptyPage(page, size),
            error: getApiErrorMessage(
              requestError,
              "Không thể tải lịch sử đơn hàng",
            ),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedOrderCode, page, requestKey, size]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    result: isCurrentRequest ? state.result : emptyPage(page, size),
    error: isCurrentRequest ? state.error : null,
    isLoading: !isCurrentRequest,
    refresh,
  };
}
