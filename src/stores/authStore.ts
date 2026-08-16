import { create } from "zustand";

import {
  clearLegacyAuthStorage,
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "@/lib/auth";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";
import type { AuthSession, LoginRequest, RegisterRequest } from "@/types";

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  syncCurrentUser: () => Promise<void>;
  syncSession: (session: AuthSession | null) => void;
  clearError: () => void;
  login: (credentials: Omit<LoginRequest, "deviceId">) => Promise<AuthSession>;
  googleLogin: (credential: string) => Promise<AuthSession>;
  register: (payload: RegisterRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isHydrated: false,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    if (get().isHydrated) return;
    clearLegacyAuthStorage();
    try {
      const session = await authService.refresh();
      saveAuthSession(session);
      set({ session, isHydrated: true });
    } catch {
      clearAuthSession();
      set({ session: null, isHydrated: true });
    }
  },

  syncCurrentUser: async () => {
    const currentSession = get().session ?? readAuthSession();
    if (!currentSession) return;

    try {
      const profile = await userService.getMyProfile();
      const session: AuthSession = {
        ...currentSession,
        user: {
          ...currentSession.user,
          username: profile.username ?? currentSession.user.username,
          fullName: profile.fullName,
          roles: profile.roles ?? [],
          shopId: profile.shopId ?? null,
          shopStatus: profile.shopStatus ?? null,
        },
      };
      saveAuthSession(session);
      set({ session });
    } catch {
      // Interceptor tự làm mới access token nếu cần; lỗi mạng tạm thời không xóa phiên.
    }
  },

  syncSession: (session) => set({ session, isHydrated: true }),

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.login(credentials);
      saveAuthSession(session);
      set({ session, isHydrated: true });
      return session;
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  googleLogin: async (credential) => {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.googleLogin(credential);
      saveAuthSession(session);
      set({ session, isHydrated: true });
      return session;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Đăng nhập bằng Google thất bại."),
      });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const session = await authService.register(payload);
      saveAuthSession(session);
      set({ session, isHydrated: true });
      return session;
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  logout: async () => {
    set({ isSubmitting: true, error: null });

    try {
      await authService.logout();
    } catch {
      // Phiên cục bộ vẫn cần được xóa nếu token đã hết hạn hoặc bị thu hồi.
    } finally {
      clearAuthSession();
      set({ session: null, isHydrated: true, isSubmitting: false });
    }
  },
}));
