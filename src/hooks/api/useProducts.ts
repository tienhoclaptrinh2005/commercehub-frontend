"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { PageResponse, ProductListFilters, ProductSummary } from "@/types";

const EMPTY_PAGE: PageResponse<ProductSummary> = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

interface UseProductsOptions extends ProductListFilters {
  page?: number;
  size?: number;
}

export function useProducts({
  page = 0,
  size = 12,
  keyword,
  categoryId,
  shopId,
}: UseProductsOptions = {}) {
  const [reloadKey, setReloadKey] = useState(0);
  const normalizedKeyword = keyword?.trim() || undefined;
  const requestKey = JSON.stringify({
    page,
    size,
    keyword: normalizedKeyword,
    categoryId,
    shopId,
    reloadKey,
  });
  const [state, setState] = useState<{
    requestKey: string;
    result: PageResponse<ProductSummary>;
    error: string | null;
  }>({
    requestKey: "",
    result: { ...EMPTY_PAGE, pageSize: size },
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const filters: ProductListFilters = {
      keyword: normalizedKeyword,
      categoryId,
      shopId,
    };
    const hasFilters = Boolean(normalizedKeyword || categoryId || shopId);

    const request = hasFilters
      ? productService.search(filters, page, size)
      : productService.getAll(page, size);

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại."));
      }, 16_000);
    });

    Promise.race([request, timeout])
      .then((nextResult) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({ requestKey, result: nextResult, error: null });
        }
      })
      .catch((requestError: unknown) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({
            requestKey,
            result: { ...EMPTY_PAGE, currentPage: page, pageSize: size },
            error: getApiErrorMessage(
              requestError,
              "Không thể tải danh sách sản phẩm",
            ),
          });
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [categoryId, normalizedKeyword, page, requestKey, shopId, size]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.requestKey === requestKey;
  const result = isCurrentRequest
    ? state.result
    : { ...EMPTY_PAGE, currentPage: page, pageSize: size };

  return {
    result,
    products: result.data,
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
    refresh,
  };
}

interface ProductState {
  shopId: number | null;
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useShopProducts(shopId?: number) {
  const [state, setState] = useState<ProductState>({
    shopId: null,
    products: [],
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (shopId === undefined) return [];

    setState({ shopId, products: [], isLoading: true, error: null });

    try {
      const nextProducts = await productService.getByShopId(shopId);
      setState({ shopId, products: nextProducts, isLoading: false, error: null });
      return nextProducts;
    } catch (requestError) {
      setState({
        shopId,
        products: [],
        isLoading: false,
        error: getApiErrorMessage(requestError, "Không thể tải sản phẩm của shop"),
      });
      return [];
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId === undefined) return;

    let isCancelled = false;

    productService
      .getByShopId(shopId)
      .then((nextProducts) => {
        if (!isCancelled) {
          setState({ shopId, products: nextProducts, isLoading: false, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            shopId,
            products: [],
            isLoading: false,
            error: getApiErrorMessage(requestError, "Không thể tải sản phẩm của shop"),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [shopId]);

  const isCurrentShop = shopId !== undefined && state.shopId === shopId;

  return {
    products: isCurrentShop ? state.products : [],
    isLoading: !isCurrentShop || state.isLoading,
    error: isCurrentShop ? state.error : null,
    refresh,
  };
}
