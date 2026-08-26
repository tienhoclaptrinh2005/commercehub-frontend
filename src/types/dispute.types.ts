export type DisputeStatus =
  | "OPEN"
  | "WARRANTY_IN_PROGRESS"
  | "WAITING_BUYER_CONFIRMATION"
  | "PROCESSING"
  | "BUYER_WIN"
  | "SELLER_WIN"
  | "CLOSED";

export interface Dispute {
  id: number;
  orderId: number;
  orderItemId: number;
  userId: number;
  shopId: number;
  reason: string;
  evidenceUrls: string[];
  shopResponse: string | null;
  shopEvidenceUrls: string[];
  status: DisputeStatus;
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

export interface CheckoutRequest {
  items: Array<{
    productVariantId: number;
    quantity: number;
    buyerInputs?: string;
  }>;
  paymentMethod: "WALLET";
  idempotencyKey: string;
}
