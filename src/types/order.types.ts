export type OrderStatus =
  | "WAITING_SELLER_ACCEPTANCE"
  | "PROCESSING"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export type OrderPaymentStatus = "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";
export type OrderCancelledBy = "BUYER" | "SELLER" | "SYSTEM" | "ADMIN";
export type OrderCancellationCode =
  | "BUYER_REQUEST"
  | "SELLER_CANCELLED"
  | "SELLER_ACCEPTANCE_TIMEOUT"
  | "SELLER_PROCESSING_TIMEOUT"
  | "ADMIN_CANCELLED";

export interface OrderSummary {
  id: number;
  orderCode: string;
  shopId: number;
  shopName: string;
  sellerUsername: string;
  buyerUsername: string;
  productNames: string[];
  variantNames: string[];
  deliveryType: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  cancelledBy: OrderCancelledBy | null;
  cancellationCode: OrderCancellationCode | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  activeDispute: boolean;
  totalAmount: number;
  placedAt: string;
}

/** Kết quả checkout chỉ dùng mã đơn công khai. */
export interface CheckoutOrderReference {
  orderCode: string;
}

export interface PreOrderItemDetail {
  buyerInputs: string | null;
  deliveryContentType: string | null;
  deliveryContent: string | null;
  acceptedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
}

export interface OrderItemDetail {
  id: number;
  productName: string;
  variantName: string;
  productType: string;
  deliveryType: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  lineSubtotal: number;
  voucherDiscount: number;
  preOrder: PreOrderItemDetail | null;
  complaintAllowed: boolean;
  complaintDeadlineAt: string | null;
  disputeId: number | null;
}

export interface OrderStatusLog {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: number | null;
  note: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  paymentMethod: string;
  subtotalAmount: number;
  voucherDiscount: number;
  approvalDeadlineAt: string | null;
  processingDeadlineAt: string | null;
  rejectionReason: string | null;
  deliveredAt: string | null;
  items: OrderItemDetail[];
  statusLogs: OrderStatusLog[];
}

export interface DeliveredAsset {
  id: number;
  orderItemId: number;
  assetType: string;
  content: string;
  deliveredAt: string;
}
