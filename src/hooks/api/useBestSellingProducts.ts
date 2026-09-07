"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { ProductSummary } from "@/types";

export function useBestSellingProducts(limit = 4) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${limit}:${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    products: ProductSummary[];
    error: string | null;
  }>({ requestKey: "", products: [], error: null });

  useEffect(() => {
    let isCancelled = false;

    productService
      .getBestSelling(limit)
      .then((nextProducts) => {
        if (!isCancelled) {
          setState({ requestKey, products: nextProducts, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            requestKey,
            products: [],
            error: getApiErrorMessage(requestError, "Không thể tải sản phẩm bán chạy"),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [limit, requestKey]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    products: isCurrentRequest ? state.products : [],
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
    refresh,
  };
}
