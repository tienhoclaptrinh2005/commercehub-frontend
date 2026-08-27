"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { orderService } from "@/services/order.service";
import type { DeliveredAsset, OrderDetail } from "@/types";

export function useOrder(orderId: number) {
  const validOrderId = Number.isSafeInteger(orderId) && orderId > 0;
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{
    orderId: number | null;
    reloadKey: number;
    order: OrderDetail | null;
    assets: DeliveredAsset[];
    error: string | null;
  }>({ orderId: null, reloadKey: -1, order: null, assets: [], error: null });

  useEffect(() => {
    let cancelled = false;

    if (!validOrderId) return;

    orderService
      .getDetail(orderId)
      .then(async (order) => {
        const assets = order.deliveryType === "INSTANT"
          ? await orderService.getDeliveredAssets(orderId)
          : [];
        return { order, assets };
      })
      .then(({ order, assets }) => {
        if (!cancelled) {
          setState({ orderId, reloadKey, order, assets, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState({
            orderId,
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
  }, [orderId, reloadKey, validOrderId]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrent = validOrderId
    && state.orderId === orderId
    && state.reloadKey === reloadKey;

  return {
    order: isCurrent ? state.order : null,
    assets: isCurrent ? state.assets : [],
    error: validOrderId ? (isCurrent ? state.error : null) : "Mã đơn hàng không hợp lệ.",
    isLoading: validOrderId && !isCurrent,
    refresh,
  };
}
