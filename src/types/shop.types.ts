import type { ShopStatus } from "./user.types";

export type PublicShopSort = "trusted" | "newest" | "name";

export interface PublicShopFilters {
  keyword?: string;
  categoryId?: number;
  sort?: PublicShopSort;
}

export interface PublicShopSummary {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerUsername: string;
  name: string;
  slug: string;
  shopAvatarUrl: string | null;
  shopCoverUrl: string | null;
  description: string | null;
  totalOrders: number;
  totalDisputes: number;
  disputeRate: number;
  ratingAvg: number;
  status: ShopStatus;
  activeProductCount: number;
  soldProductCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShopApplicationRequest {
  name: string;
  username: string;
  contactInfo: string;
  applicationReason?: string;
  acceptedTerms: true;
}

export interface ShopApplication {
  id: number;
  ownerId: number;
  username: string;
  name: string;
  contactInfo: string;
  applicationReason: string | null;
  status: ShopStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}
