"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import {
  orderService,
  type OrderHistoryCursor,
  type OrderHistoryFilters,
} from "@/services/order.service";
import type { OrderSummary, SpringSlice } from "@/types";

function emptySlice(size: number): SpringSlice<OrderSummary> {
  return {
    content: [],
    size,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  };
}

export function useOrders(
  cursor: OrderHistoryCursor | null,
  size = 10,
  filters: OrderHistoryFilters = {},
) {
  const [reloadKey, setReloadKey] = useState(0);
  const normalizedOrderCode = filters.orderCode?.trim() ?? "";
  const status = filters.status ?? "";
  const fromDate = filters.fromDate ?? "";
  const toDate = filters.toDate ?? "";
  const cursorKey = cursor
    ? `${cursor.beforePlacedAt}:${cursor.beforeId}`
    : "first";
  const requestKey = `${cursorKey}:${size}:${normalizedOrderCode}:${status}:${fromDate}:${toDate}:${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    result: SpringSlice<OrderSummary>;
    error: string | null;
  }>({ requestKey: "", result: emptySlice(size), error: null });

  useEffect(() => {
    let cancelled = false;

    orderService
      .getMyOrders(cursor, size, {
        orderCode: normalizedOrderCode,
        status,
        fromDate,
        toDate,
      })
      .then((result) => {
        if (!cancelled) setState({ requestKey, result, error: null });
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState({
            requestKey,
            result: emptySlice(size),
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
  }, [cursor, fromDate, normalizedOrderCode, requestKey, size, status, toDate]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    result: isCurrentRequest ? state.result : emptySlice(size),
    error: isCurrentRequest ? state.error : null,
    isLoading: !isCurrentRequest,
    refresh,
  };
}
