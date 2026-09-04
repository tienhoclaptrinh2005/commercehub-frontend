import type { ShopStatus } from "./user.types";

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
