import type {
  CreateDisputeRequest,
  Dispute,
  SellerDisputeResponseRequest,
  SpringPage,
} from "@/types";

import { api } from "./api";

export const disputeService = {
  async listBuyer(page = 0, size = 20): Promise<SpringPage<Dispute>> {
    return (await api.get<SpringPage<Dispute>>("/api/v1/disputes", {
      params: { page, size, sort: "createdAt,desc" },
    })).data;
  },

  async getBuyer(id: number): Promise<Dispute> {
    return (await api.get<Dispute>(`/api/v1/disputes/${id}`)).data;
  },

  async create(orderId: number, orderItemId: number, payload: CreateDisputeRequest) {
    return (await api.post<Dispute>(
      `/api/v1/orders/${orderId}/items/${orderItemId}/complain`,
      payload,
    )).data;
  },

  async confirmWarranty(id: number): Promise<Dispute> {
    return (await api.post<Dispute>(`/api/v1/disputes/${id}/confirm-warranty`)).data;
  },

  async rejectWarranty(id: number): Promise<Dispute> {
    return (await api.post<Dispute>(`/api/v1/disputes/${id}/escalate`)).data;
  },

  async withdraw(id: number): Promise<Dispute> {
    return (await api.post<Dispute>(`/api/v1/disputes/${id}/withdraw`)).data;
  },

  async listSeller(page = 0, size = 20): Promise<SpringPage<Dispute>> {
    return (await api.get<SpringPage<Dispute>>("/api/v1/seller/disputes", {
      params: { page, size, sort: "createdAt,desc" },
    })).data;
  },

  async getSeller(id: number): Promise<Dispute> {
    return (await api.get<Dispute>(`/api/v1/seller/disputes/${id}`)).data;
  },

  async startWarranty(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    return (await api.post<Dispute>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/warranty-start`,
      payload,
    )).data;
  },

  async completeWarranty(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    return (await api.post<Dispute>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/warranty-complete`,
      payload,
    )).data;
  },

  async escalateSeller(dispute: Dispute, payload: SellerDisputeResponseRequest) {
    return (await api.post<Dispute>(
      `/api/v1/seller/orders/${dispute.orderId}/items/${dispute.orderItemId}/dispute`,
      payload,
    )).data;
  },

  async listAdmin(status: string | undefined, page = 0, size = 20) {
    return (await api.get<SpringPage<Dispute>>("/api/v1/admin/disputes", {
      params: { status: status || undefined, page, size, sort: "createdAt,desc" },
    })).data;
  },

  async getAdmin(id: number): Promise<Dispute> {
    return (await api.get<Dispute>(`/api/v1/admin/disputes/${id}`)).data;
  },

  async resolveAdmin(id: number, decision: "BUYER_WIN" | "SELLER_WIN", adminNote?: string) {
    return (await api.post<Dispute>(`/api/v1/admin/disputes/${id}/resolve`, {
      decision,
      adminNote,
    })).data;
  },
};
