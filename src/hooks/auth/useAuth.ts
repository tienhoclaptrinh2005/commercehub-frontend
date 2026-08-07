import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isHydrated,
    isSubmitting,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
