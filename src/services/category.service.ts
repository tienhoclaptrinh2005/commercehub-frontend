import type { ApiResponse, CategorySummary } from "@/types";

import { api } from "./api";

export const categoryService = {
  async getAll(): Promise<CategorySummary[]> {
    const response = await api.get<ApiResponse<CategorySummary[]>>(
      "/api/v1/categories",
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không nhận được danh sách danh mục");
    }

    return response.data.data;
  },
};
