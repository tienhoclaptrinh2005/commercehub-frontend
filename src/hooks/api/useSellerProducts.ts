"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { sellerProductService } from "@/services/seller-product.service";
import type { PageResponse, SellerProductFilters, SellerProductListItem } from "@/types";

const EMPTY_PAGE: PageResponse<SellerProductListItem> = {
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

export function useSellerProducts(filters: SellerProductFilters) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = useMemo(() => JSON.stringify(filters), [filters]);
  const [state, setState] = useState<{
    requestKey: string;
    reloadKey: number;
    result: PageResponse<SellerProductListItem>;
    error: string | null;
  }>({ requestKey: "", reloadKey: -1, result: EMPTY_PAGE, error: null });

  useEffect(() => {
    let cancelled = false;
    sellerProductService
      .getMyProducts(filters)
      .then((result) => {
        if (!cancelled) setState({ requestKey, reloadKey, result, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            requestKey,
            reloadKey,
            result: EMPTY_PAGE,
            error: getApiErrorMessage(error, "Không thể tải sản phẩm của gian hàng"),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters, reloadKey, requestKey]);

  const refresh = useCallback(() => setReloadKey((current) => current + 1), []);
  const current = state.requestKey === requestKey && state.reloadKey === reloadKey;

  return {
    result: current ? state.result : EMPTY_PAGE,
    error: current ? state.error : null,
    isLoading: !current,
    refresh,
  };
}
