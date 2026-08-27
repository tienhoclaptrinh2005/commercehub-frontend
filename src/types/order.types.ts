export interface OrderSummary {
  id: number;
  orderCode: string;
  shopId: number;
  shopName: string;
  deliveryType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  placedAt: string;
}

export interface PreOrderItemDetail {
  status: string;
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
  preOrder: PreOrderItemDetail | null;
  complaintAllowed: boolean;
  complaintDeadlineAt: string | null;
  disputeId: number | null;
}

export interface OrderStatusLog {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  changedBy: number | null;
  note: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  paymentMethod: string;
  subtotalAmount: number;
  voucherDiscount: number;
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
