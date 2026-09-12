export type DisputeStatus =
  | "OPEN"
  | "WARRANTY_IN_PROGRESS"
  | "WAITING_BUYER_CONFIRMATION"
  | "PROCESSING"
  | "BUYER_WIN"
  | "SELLER_WIN"
  | "CLOSED";

export type DisputeClosedReason =
  | "BUYER_WITHDREW"
  | "BUYER_ACCEPTED_WARRANTY"
  | "BUYER_CONFIRMATION_TIMEOUT";

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
  closedReason: DisputeClosedReason | null;
  refundAmount: number | null;
  adminNote: string | null;
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
