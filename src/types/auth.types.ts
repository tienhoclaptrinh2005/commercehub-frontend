export interface ApiResponse<T> {
  success: boolean;
  code?: number;
  message?: string;
  data?: T;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: import("./user.types").UserRole[];
  shopId: number | null;
  shopStatus: import("./user.types").ShopStatus | null;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  roles: import("./user.types").UserRole[];
  shopId: number | null;
  shopStatus: import("./user.types").ShopStatus | null;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface GoogleLoginRequest {
  credential: string;
  deviceId?: string;
}
