"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { shopService } from "@/services/shop.service";
import type {
  PageResponse,
  PublicShopFilters,
  PublicShopSummary,
} from "@/types";

const EMPTY_PAGE: PageResponse<PublicShopSummary> = {
  currentPage: 0,
  pageSize: 8,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

interface UseShopsOptions extends PublicShopFilters {
  page?: number;
  size?: number;
}

export function useShops({
  page = 0,
  size = 8,
  keyword,
  categoryId,
  sort = "trusted",
}: UseShopsOptions = {}) {
  const [reloadKey, setReloadKey] = useState(0);
  const normalizedKeyword = keyword?.trim() || undefined;
  const requestKey = JSON.stringify({
    page,
    size,
    keyword: normalizedKeyword,
    categoryId,
    sort,
    reloadKey,
  });
  const [state, setState] = useState<{
    requestKey: string;
    result: PageResponse<PublicShopSummary>;
    error: string | null;
  }>({
    requestKey: "",
    result: { ...EMPTY_PAGE, pageSize: size },
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const request = shopService.getPublicShops(
      { keyword: normalizedKeyword, categoryId, sort },
      page,
      size,
    );
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại.")),
        16_000,
      );
    });

    Promise.race([request, timeout])
      .then((result) => {
        clearTimeout(timeoutId);
        if (!cancelled) setState({ requestKey, result, error: null });
      })
      .catch((requestError: unknown) => {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setState({
            requestKey,
            result: { ...EMPTY_PAGE, currentPage: page, pageSize: size },
            error: getApiErrorMessage(
              requestError,
              "Không thể tải danh sách người bán",
            ),
          });
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [categoryId, normalizedKeyword, page, requestKey, size, sort]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);
  const current = state.requestKey === requestKey;
  const result = current
    ? state.result
    : { ...EMPTY_PAGE, currentPage: page, pageSize: size };

  return {
    result,
    shops: result.data,
    isLoading: !current,
    error: current ? state.error : null,
    refresh,
  };
}
