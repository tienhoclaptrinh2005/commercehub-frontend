export type UserStatus = "ACTIVE" | "BANNED" | "SUSPENDED";
export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface PublicUserProfile {
  username: string;
  fullName: string;
  avatarUrl: string | null;
  userLevel: number;
  createdAt: string;
  completedPurchaseCount: number;
  successfulSaleCount: number;
  roles: UserRole[];
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
  avatarUrl?: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
