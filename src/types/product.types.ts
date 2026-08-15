export type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  durationDays: number | null;
  price: number;
  sortOrder: number;
  status: ProductStatus;
  stockCount: number;
}

export interface PreOrderConfig {
  id: number;
  productId: number;
  maxProcessingHours: number;
  orderInstructions: string | null;
  buyerInputFields: string | null;
  autoRejectIfUnavailable: boolean;
}

export interface ProductSummary {
  id: number;
  shopId: number;
  shopName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  productType: string;
  deliveryType: string;
  status: ProductStatus;
  soldCount: number;
  thumbnailUrl: string | null;
  stockCount: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  minPrice: number;
}

export interface ProductDetail {
  id: number;
  shopId: number;
  shopName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  productType: string;
  deliveryType: string;
  status: ProductStatus;
  soldCount: number;
  failedDisputeCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  stockCount: number;
  variants: ProductVariant[];
  preOrderConfig: PreOrderConfig | null;
}

export interface ProductListFilters {
  keyword?: string;
  categoryId?: number;
  shopId?: number;
}
