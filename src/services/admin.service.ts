import type {
  AdminAuditLog, AdminCategory, AdminDashboard, AdminDeposit, AdminFeeConfig,
  AdminProduct, AdminShop, AdminUser, AdminWalletTransaction, AdminWithdrawal,
  ApiResponse, PageResponse,
} from "@/types";
import { api } from "./api";

function unwrap<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data == null) throw new Error(response.message || fallback);
  return response.data;
}

interface ListParams { keyword?: string; status?: string; page?: number; size?: number }

export const adminService = {
  async dashboard() { const r=await api.get<ApiResponse<AdminDashboard>>("/api/v1/admin/dashboard"); return unwrap(r.data,"Không thể tải tổng quan quản trị"); },
  async users(params:ListParams & {role?:string}) { const r=await api.get<ApiResponse<PageResponse<AdminUser>>>("/api/v1/admin/users",{params}); return unwrap(r.data,"Không thể tải người dùng"); },
  async changeUserStatus(id:number,status:string,reason?:string) { await api.patch(`/api/v1/admin/users/${id}/status`,{status,reason}); },
  async shops(params:ListParams) { const r=await api.get<ApiResponse<PageResponse<AdminShop>>>("/api/v1/admin/shops",{params}); return unwrap(r.data,"Không thể tải gian hàng"); },
  async changeShopStatus(id:number,status:string,reason:string|undefined,version:number) { await api.patch(`/api/v1/admin/shops/${id}/status`,{status,reason,version}); },
  async products(params:ListParams & {shopId?:number;categoryId?:number}) { const r=await api.get<ApiResponse<PageResponse<AdminProduct>>>("/api/v1/admin/products",{params}); return unwrap(r.data,"Không thể tải sản phẩm"); },
  async changeProductStatus(id:number,status:string,reason?:string) { await api.patch(`/api/v1/admin/products/${id}/status`,{status,reason}); },
  async categories() { const r=await api.get<ApiResponse<AdminCategory[]>>("/api/v1/admin/categories"); return unwrap(r.data,"Không thể tải danh mục"); },
  async createCategory(payload:{name:string;iconUrl?:string;sortOrder?:number;parentId?:number}) { const r=await api.post<ApiResponse<AdminCategory>>("/api/v1/admin/categories",payload); return unwrap(r.data,"Không thể tạo danh mục"); },
  async updateCategory(id:number,payload:{name?:string;iconUrl?:string;sortOrder?:number;isActive?:boolean;parentId?:number}) { const r=await api.put<ApiResponse<AdminCategory>>(`/api/v1/admin/categories/${id}`,payload); return unwrap(r.data,"Không thể cập nhật danh mục"); },
  async deactivateCategory(id:number) { await api.delete(`/api/v1/admin/categories/${id}`); },
  async deposits(params:ListParams & {provider?:string}) { const r=await api.get<ApiResponse<PageResponse<AdminDeposit>>>("/api/v1/admin/deposits",{params}); return unwrap(r.data,"Không thể tải lịch sử nạp tiền"); },
  async withdrawals(params:ListParams) { const r=await api.get<ApiResponse<PageResponse<AdminWithdrawal>>>("/api/v1/admin/withdrawals",{params}); return unwrap(r.data,"Không thể tải yêu cầu rút tiền"); },
  async decideWithdrawal(id:number,action:"APPROVE"|"REJECT",note?:string) { await api.put(`/api/v1/admin/withdrawals/${id}/decision`,{action,note}); },
  async transactions(params:Omit<ListParams,"status"> & {type?:string}) { const r=await api.get<ApiResponse<PageResponse<AdminWalletTransaction>>>("/api/v1/admin/wallet-transactions",{params}); return unwrap(r.data,"Không thể tải giao dịch toàn sàn"); },
  async auditLogs(params:Omit<ListParams,"status"> & {action?:string;targetType?:string}) { const r=await api.get<ApiResponse<PageResponse<AdminAuditLog>>>("/api/v1/admin/audit-logs",{params}); return unwrap(r.data,"Không thể tải nhật ký quản trị"); },
  async feeConfigs() { const r=await api.get<ApiResponse<AdminFeeConfig[]>>("/api/v1/admin/fee-configs"); return unwrap(r.data,"Không thể tải cấu hình phí"); },
  async activeFee() { const r=await api.get<ApiResponse<AdminFeeConfig>>("/api/v1/admin/fee-configs/active"); return unwrap(r.data,"Không thể tải phí đang áp dụng"); },
  async changeFee(payload:{newFeeRate:number;newMinFeeAmount?:number;newMaxFeeAmount?:number;changeReason:string}) { const r=await api.put<ApiResponse<AdminFeeConfig>>("/api/v1/admin/fee-configs/change-rate",payload); return unwrap(r.data,"Không thể đổi phí sàn"); },
};
