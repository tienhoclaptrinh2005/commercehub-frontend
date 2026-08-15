"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { categoryService } from "@/services/category.service";
import type { CategorySummary } from "@/types";

function normalizeCategory(category: CategorySummary): CategorySummary {
  return {
    ...category,
    children: (category.children ?? [])
      .filter((child) => child.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(normalizeCategory),
  };
}

export function useCategories() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{
    reloadKey: number;
    categories: CategorySummary[];
    error: string | null;
  }>({ reloadKey: -1, categories: [], error: null });

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const request = categoryService.getAll();
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại."));
      }, 16_000);
    });

    Promise.race([request, timeout])
      .then((nextCategories) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({
            reloadKey,
            categories: nextCategories
              .filter(
                (category) =>
                  category.isActive && category.parentId == null,
              )
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map(normalizeCategory),
            error: null,
          });
        }
      })
      .catch((requestError: unknown) => {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          setState({
            reloadKey,
            categories: [],
            error: getApiErrorMessage(
              requestError,
              "Không thể tải danh mục sản phẩm",
            ),
          });
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const isCurrentRequest = state.reloadKey === reloadKey;

  return {
    categories: isCurrentRequest ? state.categories : [],
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
    refresh,
  };
}
