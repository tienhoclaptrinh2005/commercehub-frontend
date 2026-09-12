export type DisputeStatus =
  | "OPEN"
  | "WARRANTY_IN_PROGRESS"
  | "WAITING_BUYER_CONFIRMATION"
  | "ADMIN_REVIEW"
  | "RESOLVED";

export type DisputeResolution =
  | "BUYER_WIN"
  | "SELLER_WIN"
  | "BUYER_WITHDREW"
  | "WARRANTY_ACCEPTED"
  | "BUYER_CONFIRMATION_TIMEOUT";

export type DisputeResolvedBy = "BUYER" | "ADMIN" | "SYSTEM";

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
  createdAt: string;
  deadlineAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface SellerDisputeResponseRequest {
  response?: string;
  evidenceUrls?: string[];
}

export interface CreateDisputeRequest {
  reason: string;
  evidenceUrls?: string[];
}
