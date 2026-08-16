import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const syncCurrentUser = useAuthStore((state) => state.syncCurrentUser);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isHydrated,
    isSubmitting,
    error,
    login,
    googleLogin,
    register,
    logout,
    clearError,
    syncCurrentUser,
  };
}
