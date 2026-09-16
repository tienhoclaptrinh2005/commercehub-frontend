import type {
  ApiResponse,
  PageResponse,
  Voucher,
  VoucherPayload,
  VoucherPreview,
  VoucherPreviewRequest,
} from "@/types";

import { api } from "./api";

function unwrap<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const voucherService = {
  async preview(request: VoucherPreviewRequest): Promise<VoucherPreview> {
    const response = await api.post<ApiResponse<VoucherPreview>>("/api/v1/vouchers/preview", request);
    return unwrap(response.data, "Không thể kiểm tra mã giảm giá");
  },

  async listSeller(keyword = "", page = 0, size = 20): Promise<PageResponse<Voucher>> {
    const response = await api.get<ApiResponse<PageResponse<Voucher>>>("/api/v1/seller/vouchers", {
      params: { keyword, page, size },
    });
    return unwrap(response.data, "Không thể tải danh sách mã giảm giá");
  },

  async create(payload: VoucherPayload): Promise<Voucher> {
    const response = await api.post<ApiResponse<Voucher>>("/api/v1/seller/vouchers", payload);
    return unwrap(response.data, "Không thể tạo mã giảm giá");
  },

  async update(voucherId: number, payload: VoucherPayload): Promise<Voucher> {
    const response = await api.put<ApiResponse<Voucher>>(`/api/v1/seller/vouchers/${voucherId}`, payload);
    return unwrap(response.data, "Không thể cập nhật mã giảm giá");
  },

  async setActive(voucherId: number, active: boolean): Promise<Voucher> {
    const response = await api.patch<ApiResponse<Voucher>>(
      `/api/v1/seller/vouchers/${voucherId}/active`,
      null,
      { params: { active } },
    );
    return unwrap(response.data, "Không thể cập nhật trạng thái mã giảm giá");
  },
};
