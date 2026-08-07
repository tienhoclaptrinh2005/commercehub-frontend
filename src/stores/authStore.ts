import { create } from "zustand";

import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "@/lib/auth";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api";
import type { AuthSession, LoginRequest, RegisterRequest } from "@/types";

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;
  hydrate: () => void;
  syncSession: (session: AuthSession | null) => void;
  clearError: () => void;
  login: (credentials: Omit<LoginRequest, "deviceId">) => Promise<AuthSession>;
  register: (payload: RegisterRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isHydrated: false,
  isSubmitting: false,
  error: null,

  hydrate: () => {
    set({ session: readAuthSession(), isHydrated: true });
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
    const refreshToken = get().session?.refreshToken;
    set({ isSubmitting: true, error: null });

    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Phiên cục bộ vẫn cần được xóa nếu token đã hết hạn hoặc bị thu hồi.
    } finally {
      clearAuthSession();
      set({ session: null, isHydrated: true, isSubmitting: false });
    }
  },
}));
