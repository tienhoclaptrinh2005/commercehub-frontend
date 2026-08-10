"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { ProductSummary } from "@/types";

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
