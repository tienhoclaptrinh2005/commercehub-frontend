export type CartDeliveryType = "INSTANT" | "PRE_ORDER";

export interface CartItem {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantName: string;
  thumbnailUrl: string | null;
  deliveryType: CartDeliveryType;
  productType: string;
  shopId: number;
  shopName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockCount: number;
  available: boolean;
  maxProcessingHours: number | null;
  orderInstructions: string | null;
  buyerInputFields: string | null;
}

export interface Cart {
  cartId: number | null;
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productVariantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartBuyerInput {
  productVariantId: number;
  buyerInputs: string;
}

export interface CartCheckoutRequest {
  idempotencyKey: string;
  buyerInputs: CartBuyerInput[];
  vouchers: import("./voucher.types").CheckoutVoucher[];
}

export interface CheckoutRequest {
  items: Array<{
    productVariantId: number;
    quantity: number;
    buyerInputs?: string;
  }>;
  paymentMethod: "WALLET";
  idempotencyKey: string;
  vouchers: import("./voucher.types").CheckoutVoucher[];
}
