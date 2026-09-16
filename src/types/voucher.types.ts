export type VoucherDiscountType = "PERCENT" | "FIXED";
export type VoucherStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "EXHAUSTED" | "EXPIRED";

export interface Voucher {
  id: number;
  code: string;
  description: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  applyAllProducts: boolean;
  productIds: number[];
  startsAt: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherPayload {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  applyAllProducts: boolean;
  productIds: number[];
  startsAt: string;
  expiresAt: string;
  usageLimit: number;
}

export interface CheckoutVoucher {
  shopId: number;
  deliveryType: "INSTANT" | "PRE_ORDER";
  code: string;
}

export interface VoucherPreviewRequest extends CheckoutVoucher {
  items: Array<{ productVariantId: number; quantity: number }>;
}

export interface VoucherPreview {
  voucherId: number;
  code: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
}
