export type DisputeStatus =
  | "OPEN"
  | "WARRANTY_IN_PROGRESS"
  | "WAITING_BUYER_CONFIRMATION"
  | "ADMIN_REVIEW"
  | "RESOLVED";

export type DisputeResolution =
  | "BUYER_WIN"
  | "SELLER_WIN"
  | "SELLER_REFUND"
  | "BUYER_WITHDREW"
  | "WARRANTY_ACCEPTED"
  | "BUYER_CONFIRMATION_TIMEOUT";

export type DisputeResolvedBy = "BUYER" | "SELLER" | "ADMIN" | "SYSTEM";
export type DisputeEscalatedBy = "BUYER" | "SELLER";

export interface Dispute {
  id: number;
  orderId: number;
  orderItemId: number;
  userId: number;
  shopId: number;
  orderCode: string;
  shopName: string;
  productName: string;
  variantName: string;
  disputedAmount: number | null;
  buyerUsername: string | null;
  sellerUsername: string | null;
  reason: string;
  evidenceUrls: string[];
  shopResponse: string | null;
  shopEvidenceUrls: string[];
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolvedBy: DisputeResolvedBy | null;
  refundAmount: number | null;
  resolutionNote: string | null;
  resolverId: number | null;
  escalatedAt: string | null;
  escalatedBy: DisputeEscalatedBy | null;
  escalationReason: string | null;
  adminOverdue: boolean;
  createdAt: string;
  deadlineAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface SellerDisputeResponseRequest {
  response?: string;
  evidenceUrls?: string[];
}

export interface EscalateDisputeRequest {
  reason: string;
  evidenceUrls?: string[];
}

export interface AdminDisputeListParams {
  scope?: "QUEUE" | "ALL";
  status?: DisputeStatus;
  keyword?: string;
  overdue?: boolean;
  page?: number;
  size?: number;
}

export interface AdminDisputeSummary {
  pendingCount: number;
  overdueCount: number;
}

export interface CreateDisputeRequest {
  reason: string;
  evidenceUrls?: string[];
}
