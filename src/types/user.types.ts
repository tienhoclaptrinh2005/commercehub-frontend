export type UserStatus = "ACTIVE" | "BANNED" | "SUSPENDED";
export type UserRole = "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
export type ShopStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "BANNED";

export interface PublicUserProfile {
  username: string;
  fullName: string;
  avatarUrl: string | null;
  userLevel: number;
  createdAt: string;
  completedPurchaseCount: number;
  successfulSaleCount: number;
  roles: UserRole[];
  shopId: number | null;
  shopName: string | null;
  shopAvatarUrl: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  phone: string | null;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  userLevel: number;
  accumulatedSpent: number;
  accumulatedEarned: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
  /** TODO BACKEND: trả false sau khi người dùng đã đổi username một lần. */
  usernameChangeAllowed?: boolean;
  roles: UserRole[];
  shopId: number | null;
  shopStatus: ShopStatus | null;
}

export interface UserLevel {
  level: number;
  label: string;
  minSpent: number;
  allowedProductCount: number;
  description: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
}

export interface PresignAvatarImageUpload {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
  maxFileSizeBytes: number;
  requiredWidth: number;
  requiredHeight: number;
  cacheControl: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
