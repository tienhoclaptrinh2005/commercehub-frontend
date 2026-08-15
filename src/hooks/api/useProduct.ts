"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { ProductDetail } from "@/types";

interface ProductDetailState {
  requestKey: string;
  product: ProductDetail | null;
  error: string | null;
}

export function useProduct(slug: string) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${slug}:${reloadKey}`;
  const [state, setState] = useState<ProductDetailState>({
    requestKey: "",
    product: null,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const request = productService.getBySlug(slug);
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại."));
      }, 16_000);
    });

    Promise.race([request, timeout])
      .then((product) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({ requestKey, product, error: null });
        }
      })
      .catch((requestError: unknown) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({
            requestKey,
            product: null,
            error: getApiErrorMessage(
              requestError,
              "Không thể tải thông tin sản phẩm",
            ),
          });
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [requestKey, slug]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    product: isCurrentRequest ? state.product : null,
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
    refresh,
  };
}
