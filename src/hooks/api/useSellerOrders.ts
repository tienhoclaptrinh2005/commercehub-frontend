"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import {
  sellerOrderService,
  type SellerOrderCursor,
  type SellerOrderFilters,
} from "@/services/seller-order.service";
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

export function useSellerOrders(
  cursor: SellerOrderCursor | null,
  size: number,
  filters: SellerOrderFilters,
) {
  const [reloadKey, setReloadKey] = useState(0);
  const search = filters.search?.trim() ?? "";
  const deliveryType = filters.deliveryType ?? "";
  const status = filters.status ?? "";
  const fromDate = filters.fromDate ?? "";
  const toDate = filters.toDate ?? "";
  const cursorKey = cursor
    ? `${cursor.beforePlacedAt}:${cursor.beforeId}`
    : "first";
  const requestKey = `${cursorKey}:${size}:${search}:${deliveryType}:${status}:${fromDate}:${toDate}:${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    result: SpringSlice<OrderSummary>;
    error: string | null;
  }>({ requestKey: "", result: emptySlice(size), error: null });

  useEffect(() => {
    let cancelled = false;
    sellerOrderService
      .getOrders(cursor, size, {
        search,
        deliveryType: deliveryType || undefined,
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
            error: getApiErrorMessage(requestError, "Không thể tải danh sách đơn bán"),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cursor, deliveryType, fromDate, requestKey, search, size, status, toDate]);

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
