import type {
  ApiResponse,
  CreateDisputeRequest,
  Dispute,
  PageResponse,
  SellerDisputeResponseRequest,
} from "@/types";

import { api } from "./api";

function unwrap<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message || fallbackMessage);
  }
  return response.data;
}

export const disputeService = {
  async listBuyer(page = 0, size = 20): Promise<PageResponse<Dispute>> {
    const response = await api.get<ApiResponse<PageResponse<Dispute>>>("/api/v1/disputes", {
      params: { page, size, sort: "createdAt,desc" },
    });
    return unwrap(response.data, "Không thể tải danh sách khiếu nại");
  },

  async getBuyer(id: number): Promise<Dispute> {
    const response = await api.get<ApiResponse<Dispute>>(`/api/v1/disputes/${id}`);
    return unwrap(response.data, "Không thể tải khiếu nại");
  },

  async create(orderCode: string, orderItemId: number, payload: CreateDisputeRequest) {
    const response = await api.post<ApiResponse<Dispute>>(
      `/api/v1/orders/${encodeURIComponent(orderCode)}/items/${orderItemId}/complain`,
      payload,
    );
    return unwrap(response.data, "Không thể tạo khiếu nại");
  },

  async confirmWarranty(id: number): Promise<Dispute> {
    const response = await api.post<ApiResponse<Dispute>>(`/api/v1/disputes/${id}/confirm-warranty`);
    return unwrap(response.data, "Không thể xác nhận bảo hành");
  },

  async rejectWarranty(id: number): Promise<Dispute> {
    const response = await api.post<ApiResponse<Dispute>>(`/api/v1/disputes/${id}/escalate`);
    return unwrap(response.data, "Không thể chuyển khiếu nại đến quản trị viên");
  },

  async withdraw(id: number): Promise<Dispute> {
    const response = await api.post<ApiResponse<Dispute>>(`/api/v1/disputes/${id}/withdraw`);
    return unwrap(response.data, "Không thể rút khiếu nại");
  },

  async listSeller(page = 0, size = 20): Promise<PageResponse<Dispute>> {
    const response = await api.get<ApiResponse<PageResponse<Dispute>>>("/api/v1/seller/disputes", {
      params: { page, size, sort: "createdAt,desc" },
    });
    return unwrap(response.data, "Không thể tải danh sách khiếu nại của gian hàng");
  },

  async getSeller(id: number): Promise<Dispute> {
    const response = await api.get<ApiResponse<Dispute>>(`/api/v1/seller/disputes/${id}`);
    return unwrap(response.data, "Không thể tải khiếu nại của gian hàng");
  },

  async startWarranty(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    const response = await api.post<ApiResponse<Dispute>>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/warranty-start`,
      payload,
    );
    return unwrap(response.data, "Không thể tiếp nhận bảo hành");
  },

  async completeWarranty(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    const response = await api.post<ApiResponse<Dispute>>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/warranty-complete`,
      payload,
    );
    return unwrap(response.data, "Không thể hoàn thành bảo hành");
  },

  async escalateSeller(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    const response = await api.post<ApiResponse<Dispute>>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/dispute`,
      payload,
    );
    return unwrap(response.data, "Không thể chuyển tranh chấp đến quản trị viên");
  },

  async listAdmin(status: string | undefined, page = 0, size = 20): Promise<PageResponse<Dispute>> {
    const response = await api.get<ApiResponse<PageResponse<Dispute>>>("/api/v1/admin/disputes", {
      params: { status: status || undefined, page, size, sort: "createdAt,desc" },
    });
    return unwrap(response.data, "Không thể tải danh sách tranh chấp");
  },

  async getAdmin(id: number): Promise<Dispute> {
    const response = await api.get<ApiResponse<Dispute>>(`/api/v1/admin/disputes/${id}`);
    return unwrap(response.data, "Không thể tải tranh chấp");
  },

  async resolveAdmin(id: number, decision: "BUYER_WIN" | "SELLER_WIN", resolutionNote?: string) {
    const response = await api.post<ApiResponse<Dispute>>(`/api/v1/admin/disputes/${id}/resolve`, {
      decision,
      resolutionNote,
    });
    return unwrap(response.data, "Không thể giải quyết tranh chấp");
  },
};
