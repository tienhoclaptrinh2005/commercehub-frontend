"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { orderService } from "@/services/order.service";
import type { DeliveredAsset, OrderDetail } from "@/types";

export function useOrder(orderCode: string) {
  const normalizedOrderCode = orderCode.trim();
  const validOrderCode = normalizedOrderCode.length > 0 && normalizedOrderCode.length <= 50;
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{
    orderCode: string | null;
    reloadKey: number;
    order: OrderDetail | null;
    assets: DeliveredAsset[];
    error: string | null;
  }>({ orderCode: null, reloadKey: -1, order: null, assets: [], error: null });

  useEffect(() => {
    let cancelled = false;

    if (!validOrderCode) return;

    orderService
      .getDetail(normalizedOrderCode)
      .then(async (order) => {
        const assets = order.deliveryType === "INSTANT"
          ? await orderService.getDeliveredAssets(normalizedOrderCode)
          : [];
        return { order, assets };
      })
      .then(({ order, assets }) => {
        if (!cancelled) {
          setState({ orderCode: normalizedOrderCode, reloadKey, order, assets, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState({
            orderCode: normalizedOrderCode,
            reloadKey,
            order: null,
            assets: [],
            error: getApiErrorMessage(
              requestError,
              "Không thể tải chi tiết đơn hàng",
            ),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedOrderCode, reloadKey, validOrderCode]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrent = validOrderCode
    && state.orderCode === normalizedOrderCode
    && state.reloadKey === reloadKey;

  return {
    order: isCurrent ? state.order : null,
    assets: isCurrent ? state.assets : [],
    error: validOrderCode ? (isCurrent ? state.error : null) : "Mã đơn hàng không hợp lệ.",
    isLoading: validOrderCode && !isCurrent,
    refresh,
  };
}
